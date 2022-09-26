import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./Map.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoicGhpbGx5d29sZjIyIiwiYSI6ImNqcnpwMXlzbzFiNDY0OWx2MG9scDduZjQifQ.ZqHZhUY_sG7de-l8ChzWfQ";

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-65.9);
  const [lat, setLat] = useState(45.35);
  const [zoom, setZoom] = useState(5);

  const [onOff, setOnOff] = useState("off");
  const [earthOnOff, setEarthOnOff] = useState("off");
  const [mapType, setMapType] = useState("");

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("style.load", function () {
      console.log(mapType);
      console.log(earthOnOff);
      map.current.addSource("maine", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            // These coordinates outline Maine.
            coordinates: [
              [
                [-67.13734, 45.13745],
                [-66.96466, 44.8097],
                [-68.03252, 44.3252],
                [-69.06, 43.98],
                [-70.11617, 43.68405],
                [-70.64573, 43.09008],
                [-70.75102, 43.08003],
                [-70.79761, 43.21973],
                [-70.98176, 43.36789],
                [-70.94416, 43.46633],
                [-71.08482, 45.30524],
                [-70.66002, 45.46022],
                [-70.30495, 45.91479],
                [-70.00014, 46.69317],
                [-69.23708, 47.44777],
                [-68.90478, 47.18479],
                [-68.2343, 47.35462],
                [-67.79035, 47.06624],
                [-67.79141, 45.70258],
                [-67.13734, 45.13745],
              ],
            ],
          },
        },
      });

      map.current.addSource("earthquakes", {
        type: "geojson",
        // Use a URL for the value for the `data` property.
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
      });

      map.current.addSource("ny_zips", {
        type: "geojson",
        // Use a URL for the value for the `data` property.
        data: "https://raw.githubusercontent.com/fedhere/PUI2015_EC/master/mam1612_EC/nyc-zip-code-tabulation-areas-polygons.geojson",
      });

      map.current.addSource("tornados", {
        type: "geojson",
        data: "https://raw.githubusercontent.com/cutting-room-floor/tornado-analysis/master/tornadoes.json",
      });
      map.current.addLayer({
        id: "maine",
        type: "fill",
        source: "maine", // reference the data source
        layout: { visibility: "visible" },
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.5,
        },
      });

      map.current.addLayer({
        id: "outline",
        type: "line",
        source: "maine",
        layout: { visibility: onOff === "off" ? "visible" : "none" },
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });

      map.current.addLayer({
        id: "tornado-layer",
        type: "line",
        source: "tornados",
        paint: {
          "line-color": "#0f3c4c",
          "line-width": 3,
        },
      });
      map.current.addLayer({
        id: "earthquakes-layer",
        type: "circle",
        source: "earthquakes",
        layout: { visibility: earthOnOff === "off" ? "visible" : "none" },
        paint: {
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-color": "red",
          "circle-stroke-color": "white",
        },
      });

      map.current.addLayer({
        id: "nyzips",
        type: "line",
        source: "ny_zips",
        layout: { visibility: onOff ? "visible" : "none" },
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
      map.current.addLayer({
        id: "ny_fill_layer",
        type: "fill",
        source: "ny_zips",
        paint: {
          "fill-color": "rgba(200, 100, 240, 0.4)",
          "fill-outline-color": "rgba(200, 100, 240, 1)",
        },
      });

      console.log(map.current.getLayoutProperty("maine", "visibility"));
    });
    map.current.on("mouseenter", "earthquakes-layer", () => {
      map.current.getCanvas().style.cursor = "pointer";
      console.log("hovering over earthquake layer");
    });

    map.current.on("mouseleave", "earthquakes-layer", () => {
      map.current.getCanvas().style.cursor = "";
    });

    map.current.on("mouseenter", "ny_fill_layer", () => {
      map.current.getCanvas().style.cursor = "pointer";
      console.log("hovering over NY zipcodes layer");
    });

    map.current.on("mouseleave", "ny_fill_layer", () => {
      map.current.getCanvas().style.cursor = "";
    });

    map.current.on("click", "earthquakes-layer", e => {
      console.log(e.lnglat);
      const coordinates = e.features[0].geometry.coordinates.slice();
      const mag = e.features[0].properties.mag;
      new mapboxgl.Popup()
        .setMaxWidth("400px")
        .setLngLat(coordinates)
        // .setLngLat([-67.13734, 45.13745])
        .setHTML(`<h1> Magnitude: ${mag} </h1>`)
        .addTo(map.current);
    });

    map.current.on("click", "ny_fill_layer", e => {
      console.log(e.lnglat);
      //const coordinates = e.features[0].geometry.coordinates.slice();
      const place = e.features[0].properties.PO_NAME;
      new mapboxgl.Popup()
        .setMaxWidth("400px")
        .setLngLat(e.lngLat)
        // .setLngLat([-67.13734, 45.13745])
        .setHTML(`<h1> Place: ${place} </h1>`)
        .addTo(map.current);
    });
    ////
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const toggleLayers = map => {
    if (onOff === "off") {
      map.current.setLayoutProperty("maine", "visibility", "none");
      map.current.setLayoutProperty("outline", "visibility", "none");
    } else {
      map.current.setLayoutProperty("maine", "visibility", "visible");
      map.current.setLayoutProperty("outline", "visibility", "visible");
    }
  };

  const toggleEarthLayers = map => {
    console.log(earthOnOff);
    if (earthOnOff === "off") {
      map.current.setLayoutProperty("earthquakes-layer", "visibility", "none");
      //map.current.setPaintProperty("tornado-layer", "line-color", "#ff69b4"); // this works here
    } else {
      map.current.setLayoutProperty(
        "earthquakes-layer",
        "visibility",
        "visible"
      );
    }
  };

  const handleLayer = () => {
    console.log(onOff);
    if (onOff === "on") {
      setOnOff("off");
    } else {
      setOnOff("on");
    }

    toggleLayers(map);
  };

  const handleEarthLayer = () => {
    if (earthOnOff === "on") {
      setEarthOnOff("off");
    } else {
      setEarthOnOff("on");
    }
    toggleEarthLayers(map);
  };

  const changeBaseMap = () => {
    //console.log(mapType);
    if (mapType === "streets-v11") {
      map.current.setStyle(`mapbox://styles/mapbox/satellite-v9`);

      //map.current.setPaintProperty("tornado-layer", "line-color", "#ff69b4");
      setMapType("satellite-v9");
    } else {
      map.current.setStyle(`mapbox://styles/mapbox/streets-v11`);
      setMapType("streets-v11");
    }
  };
  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <button className="button-sidebar" onClick={handleLayer}>
        Toggle Maine
      </button>
      <button className="button-sidebar" onClick={handleEarthLayer}>
        Toggle earthquakes
      </button>

      <button className="button-sidebar" onClick={changeBaseMap}>
        Toggle base Map
      </button>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
