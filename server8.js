var io = require('socket.io').listen(3001); 
var Connection = require('tedious').Connection; 
var Request = require('tedious').Request;

var guAccion = 0;
var guMandante = "";
var guMaterial = "";

function CreaObjeto(RESULTADO,MATKL,MEINS,XCHPF,MAKTX,EAN11,RELLENO) {
	this.RESULTADO = 
    this.MATKL = MATKL;
	this.MEINS = MEINS;
	this.XCHPF = XCHPF;
	this.MAKTX = MAKTX;
	this.EAN11 = EAN11;
	this.RELLENO = RELLENO;
}	

var loObj2 = new CreaObjeto("","","","","","","");

function getSQL(callback) {
	var TYPES = require('tedious').TYPES;

    try {
		var arrObj = [];
		var loMATKL = "";
		var loMEINS = "";
		var loXCHPF = "";
		var loMAKTX = "";
		var loEAN11 = "";
		
		var config = {userName: 'manovelo',  password: 'soporte1965', server: 'sapuf-pro', domain: 'GRUPOULTRA', options: { database: "UFP" } };
		var connection = new Connection(config); 
	    connection.on('connect', function (err) {
		    request = new Request("SELECT a.MANDT, a.MATNR, a.MATKL, a.MEINS, a.XCHPF, a.EAN11, b.MAKTX " + 
                                   "FROM ufp.MARA AS a " +
                                   "INNER JOIN ufp.MAKT AS b " +
                                   "ON b.MATNR = a.MATNR AND b.MANDT = a.MANDT " +
                                   "WHERE a.MATNR = @MATNR and a.MANDT = @MANDT", function (err,rowCount) {
			    if (err) {
        			console.log("Error en Request : " + err);
		    	}
			    else {
				    /* console.log(rowCount + ' Filas'); */
			    }
			    connection.close();
		    });

            request.on('row',function (columns) {
				columns.forEach(function (column) {
				    if (column.value == null) {
					    console.log("NULL");
				    }
				    else {
					    console.log(column.metadata.colName + " : " + column.value);
						switch (column.metadata.colName) {
							case "MATKL":
								loMATKL = column.value;
								break;
							case "MEINS":
								loMEINS = column.value;
								break;
							case "XCHPF":
								loXHCPF = column.value;
								break;
							case "EAN11":
								loEAN11 = column.value;
								break;
							case "MAKTX":
								loMAKTX = column.value;
								break;
						}
				    }
			    });
				var loObj2 = new CreaObjeto("OK",loMATKL,loMEINS,loXHCPF,loMAKTX,loEAN11);
				callback(null,loObj2); 
				
		    });
		
		    request.on('done', function(rowCount,more) {
			    console.log(rowCount + " filas recividas");
		    });

			request.addParameter('MANDT', TYPES.VarChar, guMandante);
			request.addParameter('MATNR', TYPES.VarChar, guMaterial);
			
		    connection.execSql(request);
			
	    } ); 
    }	
    catch (Error) {
		var loObj2 = new CreaObjeto("ERROR","","","","","");
		callback(null,loObj2); 
	    console.log("Catch : " + Error);
    }
}

function getSQL02(callback) {
	var loMensaje = "MIGUEL";
	
	callback(null,loMensaje);
}

io.sockets.on('connection', function (socket) {
    socket.on('mensaje_cliente', function (mensaje) {
		console.log("alguien se ha conectado " + mensaje.mandante + " " + mensaje.material);
		guAccion   = mensaje.accion;
		guMandante = mensaje.mandante;
		guMaterial = mensaje.material;
		console.log("01");
		getSQL(function(err, result) {
			mensaje = result;
			loObj2.RESULTADO = mensaje.RESULTADO;
			loObj2.MATKL     = mensaje.MATKL;
			loObj2.MEINS     = mensaje.MEINS;
			loObj2.XHCPF     = mensaje.XHCPF;
			loObj2.MAKTX     = mensaje.MAKTX;
			loObj2.EAN11     = mensaje.EAN11;
			mensaje = loObj2;
			console.log("aaaa " + loObj2.MATKL);
			io.sockets.emit("mensaje_servidor" , mensaje);
		});
		console.log("02");
		getSQL02(function(err, result) {
			loObj2.RELLENO = result;
			console.log("bbbb");
		});	
		console.log("03");

    })
});

