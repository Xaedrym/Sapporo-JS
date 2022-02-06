let tab_marker = [];

// Function permettant de centrer la latitude et la longitude
function center_map(lines){
    let lat_average = 0;
    let long_average = 0;
    let length = 0;
    for(let line in lines) {
        for(let station of lines[line]){
            lat_average += station[0];
            long_average += station[1];
        }
        length += lines[line].length;
    }
    lat_average /= length;
    long_average /= length;
    return [lat_average, long_average];
}

document.addEventListener("DOMContentLoaded", async function() {

    var mymap = L.map('map', { 
        zoom: 12 
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mymap);

    var response = await fetch("http://localhost:8080/lines");  

    if (response.status == 200) {
        var data = await response.json();
        mymap.setView(center_map(data));
        let tab_polyline = [];
        for(let line in data){
            var polyline = L.polyline(data[line], {color: line, weight: 5}).addTo(mymap );
            if(tab_polyline[line] == null){
                tab_polyline[line] = [];
            }
            tab_polyline[line] = polyline;
            tab_polyline[line].on('click', async function(e){
                var raiponce = await fetch("http://localhost:8080/stations/"+line); 
                if(raiponce.status == 200){
                    var data_2 = await raiponce.json();
                    console.log(data_2);
                    while(tab_marker.length > 0){
                        tab_marker.pop().remove();
                    }
                    for(let station of data_2){
                        var marker = new L.marker([station.lat, station.long]);
                        let colors = "";
                        for(const color in station.lignes){
                            colors += color + " : " + station.lignes[color] + "<br>";
                        }
                        marker.bindPopup('<p>'+station.nom_station+'</p>' + '<p>'+ colors +'</p>');
                        mymap.addLayer(marker);
                        tab_marker.push(marker);
                    }
                }
            });
            console.log(tab_polyline[line]);
        }
    }
});