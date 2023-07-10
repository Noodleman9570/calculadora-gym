$(document).ready(function () {
  var table = $("#example").DataTable({
    responsive: true,

    buttons: ["copy", "excel", "pdf", "print"],

    language: {
      processing: "Procesando...",
      lengthMenu: "Mostrar _MENU_ registros",
      zeroRecords: "No se encontraron resultados",
      emptyTable: "Ningún dato disponible en esta tabla",
      info: "Mostrando la pagina _PAGES_ de _PAGES_",
      infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
      infoFiltered: "(filtrado de un total de _MAX_ registros)",
      search: "Buscar:",
      loadingRecords: "Cargando...",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior",
      },
    },
  });

  table.buttons().container().appendTo("#example_wrapper .col-md-6:eq(0)");
});

const borrar = () => {
  var cantidadNets = document.getElementById("nets").innerHTML;
  for (var i = 1; i <= cantidadNets; i++) {
    document.getElementById("name" + i).value = "Host" + i;
    document.getElementById("hosts" + i).value = "";
  }
};

const cambiarSubRed = () => {
  var numeroSubnets = document.getElementById("numero_subnets").value;

  if (numeroSubnets % 1 !== 0) alert("Ingrese numeros sin comas");
  else {
    if (numeroSubnets > 999 || numeroSubnets < 2) alert("Ingrese solo numeros positivos entre 2 y 999");
    else {
      var paragraph =
        "<span class='column'>Nombre de las subnets:</span> <span class='column'>Numero de Host:</span><br>";
      for (var i = 1; i <= numeroSubnets; i++) {
        if (document.getElementById("name" + i) != null) var subnetName = document.getElementById("name" + i).value;
        else var subnetName = "Host" + i;
        paragraph +=
          "<label type='text' id='name" +
          i +
          "' value='" +
          subnetName +
          "' >Subred" +
          i +
          "</label> <input type='text' id='hosts" +
          i +
          "' tabindex='" +
          i +
          "'  ><br>";
      }
      document.getElementById("nets").innerHTML = numeroSubnets;
      document.getElementById("subnet_pargraph").innerHTML = paragraph;
    }
  }
};

const calcular = () => {
  var inputNetwork = document.getElementById("input_network").value;
  if (!validar(inputNetwork)) {
    document.getElementById("validar_ip").innerHTML =
      "<b>No es una ip valida</b>";
    return;
  }
  document.getElementById("validar_ip").innerHTML = "";
  var subnetSlash = obtenerSlash(inputNetwork);
  var subnetHosts = obtenerHost(subnetSlash);
  var subnetMask = obtenerMascara(subnetSlash);
  var subnetNetAdd = encontrarRed(obtenerIP(inputNetwork), subnetMask);
  var orderedHosts = ordenarHost(document.getElementById("nets").innerHTML);
  var result =
    "<h4 class='text-center rounded title my-4'>Su IP tiene " +
    subnetHosts +
    " hosts.<br></h4>";
  var table =
    "<div class='container-fluid col-8'><table id='example' class='table table-striped' style='width:100%' border='2'><tr><td>Subredes</td><td>IP</td><td>Hosts  Disponibles</td><td>Prefijo</td><td>Mascara</td><td>Rango de Hosts</td><td>Broadcast</td></tr>";
  var currentNet = subnetNetAdd;
  var usedHosts = 0;
  for (var i = 0; i < orderedHosts.length; i++) {
    var subnetPrefix = encontrarSlash(orderedHosts[i][0]);
    var subnetMask = obtenerMascara(subnetPrefix);
    var subnetNetAdd = encontrarRed(currentNet, subnetMask);
    usedHosts += obtenerHost(subnetPrefix) + 2;
    table += "<tr><td>Host" + (i + 1) + "</td>";
    table +=
      "<td>" +
      subnetNetAdd[0] +
      "." +
      subnetNetAdd[1] +
      "." +
      subnetNetAdd[2] +
      "." +
      subnetNetAdd[3] +
      "</td>";
    table += "<td class='text-center'>" + obtenerHost(subnetPrefix) + "</td>";
    table += "<td>/" + subnetPrefix + "</td>";
    currentNet = encontrarBroadcast(
      encontrarWildcard(subnetMask),
      subnetNetAdd
    );
    table +=
      "<td>" +
      subnetMask[0] +
      "." +
      subnetMask[1] +
      "." +
      subnetMask[2] +
      "." +
      subnetMask[3] +
      "</td>";
    table +=
      "<td>" +
      subnetNetAdd[0] +
      "." +
      subnetNetAdd[1] +
      "." +
      subnetNetAdd[2] +
      "." +
      (subnetNetAdd[3] + 1) +
      " - " +
      currentNet[0] +
      "." +
      currentNet[1] +
      "." +
      currentNet[2] +
      "." +
      (currentNet[3] - 1) +
      "</td>";
    table +=
      "<td>" +
      currentNet[0] +
      "." +
      currentNet[1] +
      "." +
      currentNet[2] +
      "." +
      currentNet[3] +
      "</td>";
    currentNet = siguienteRedAnadir(currentNet);
  }
  table += "</table></div>";
  if (usedHosts > subnetHosts + 2) {
    result += "<span style='background-color:yellow;'></span><br>";
  }
  result += table;
  document.getElementById("ans").innerHTML = result;
};

const validar = (ip) => {
  var regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([1-9]|[1-2][0-9]|3[0-2])$/;
  if (ip.match(regex)) return true;
  return false;
};

const obtenerIP = (network) => {
  var parts = network.split("/");
  return parts[0].split(".");
};

const obtenerSlash = (network) => {
  var parts = network.split("/");
  return parts[1];
};


const obtenerHost = (slash) => {
  return Math.pow(2, 32 - slash) - 2;
};

const obtenerMascara = (slash) => {
  var mask = new Array();
  for (var i = 0; i < 4; i++) {
    mask[i] = 0;
  }
  if (slash < 8) {
    mask[0] = 256 - Math.pow(2, 32 - (slash + 24));
  } else {
    if (slash < 16) {
      mask[0] = 255;
      mask[1] = 256 - Math.pow(2, 32 - (slash + 16));
    } else {
      if (slash < 24) {
        mask[0] = 255;
        mask[1] = 255;
        mask[2] = 256 - Math.pow(2, 32 - (slash + 8));
      } else {
        mask[0] = 255;
        mask[1] = 255;
        mask[2] = 255;
        mask[3] = 256 - Math.pow(2, 32 - slash);
      }
    }
  }
  return mask;
};


const encontrarWildcard = (mask) => {
    var wildcard = new Array();
    for (var i = 0; i < 4; i++) {
        wildcard[i] = 255 - mask[i];
    }
    return wildcard;
};

const encontrarRed = (ip, mask) => {
  var netAdd = new Array();
  for (var i = 0; i < 4; i++) {
    netAdd[i] = ip[i] & mask[i];
  }
  return netAdd;
};

const ordenarHost = (numNets) => {
  var orderedHosts = new Array();
  var index = 0;
  for (var i = 1; i <= numNets; i++) {
    var name = "name" + i;
    var hosts = "hosts" + i;
    name = document.getElementById(name).value;
    hosts = document.getElementById(hosts).value;
    if (hosts >= 1) {
      orderedHosts[index] = [hosts, name];
      index++;
    }
  }
  orderedHosts.sort(function (a, b) {
    return b[0] - a[0];
  });
  return orderedHosts;
};

const encontrarBroadcast = (wildcard, ip) => {
  var broadcast = new Array();
  for (var i = 0; i < 4; i++) {
    broadcast[i] = wildcard[i] | parseInt(ip[i]);
  }
  return broadcast;
};


const sumarHost = (numNets) => {
  var total = 0;
  for (var i = 1; i <= numNets; i++) {
    var hosts = "hosts" + i;
    hosts = parseInt(document.getElementById(hosts).value);
    if (hosts >= 1) {
      total += hosts;
    }
  }
  return total;
};

const encontrarSlash = (hosts) => {
  for (var i = 2; i < 33; i++) {
    if (hosts <= Math.pow(2, i) - 2) {
      return 32 - i;
    }
  }
  return "";
};

const siguienteRedAnadir = (ip) => {
  if (ip[3] < 255) {
    ip[3]++;
  } else {
    if (ip[2] < 255) {
      ip[3] = 0;
      ip[2]++;
    } else {
      if (ip[1] < 255) {
        ip[3] = 0;
        ip[2] = 0;
        ip[1]++;
      } else {
        ip[3] = 0;
        ip[2] = 0;
        ip[1] = 0;
        ip[0]++;
      }
    }
  }
  return ip;
};
