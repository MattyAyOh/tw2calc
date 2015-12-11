/* Load data */
info.update(null, "Preparing map");

$.getJSON("./en15db/db/villagesGeoJSON.json", function(json) {
    mapGeoJson = L.geoJson(json, {
        style: styleByActivity,
        onEachFeature: onEachMapFeature
    }).addTo(map);

    miniMapGeoJson = L.geoJson(json, {
        style: styleNormalMiniMap,
        onEachFeature: onEachMiniMapFeature
    }).addTo(miniMap);

    info.update(null, "Ready to use");
});