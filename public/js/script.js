const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
        },
        (err) => {
            console.error(err);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const markers = {}; 

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 20); 

    if (markers[id]) {
    
        markers[id].setLatLng([latitude, longitude]);
    } else {
       
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ID: ${id}<br>Lat: ${latitude}<br>Lng: ${longitude}`)
            .openPopup(); 
    }
});

socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); 
        delete markers[id];
    }
});