define([
	'esri/InfoTemplate'
], function(InfoTemplate) {
	return {
		// url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
		proxy: {
			url: "proxy/proxy.ashx",
			alwaysUseProxy: false
		},
		// url to your geometry server.
		geometryService: {
			url: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
		},
		// basemapMode: must be either "agol" or "custom"
		//basemapMode: "custom",
		basemapMode: "agol",
		// defaultBasemap: valid options for "agol" mode: "streets", "satellite", "hybrid", "topo", "gray", "oceans", "national-geographic", "osm"
		//mapStartBasemap: "lightGray",
		mapStartBasemap: "osm",
		//basemapsToShow: basemaps to show in menu. If "agol" mode use valid values from above, if "custom" mode then define in basmaps dijit and refrenc by name here
		//basemapsToShow: ["street", "satellite", "hybrid", "satTrans", "lightGray"],
		basemapsToShow: ["streets", "satellite", "hybrid", "topo", "gray", "oceans", "national-geographic", "osm"],
		// initialExtent: extent the the map starts at. Helper tool: http://www.arcgis.com/home/item.html?id=dd1091f33a3e4ecb8cd77adf3e585c8a
//		initialExtent: {
//			xmin: -15489130.48708616,
//			ymin: 398794.4860580916,
//			xmax: -5891085.7193757,
//			ymax: 8509680.431452557,
		initialExtent: {
			xmin: 10028538.11101254,
			ymin: -1883408.3769462947,
			xmax: 17072974.63777251,
			ymax: 1629025.9468131908,
			spatialReference: {
				wkid: 102100
			}
		},
		// operationalLayers: Array of Layers to load on top of the basemap: valid 'type' options: "dynamic", "tiled", "feature".
		// The 'options' object is passed as the layers options for constructor. Title will be used in the legend only. id's must be unique and have no spaces.
		// 3 'mode' options: MODE_SNAPSHOT = 0, MODE_ONDEMAND = 1, MODE_SELECTION = 2
		/* load layer from xml
		
		layerList : {
			if (window.XMLHttpRequest)
				{// code for IE7+, Firefox, Chrome, Opera, Safari
					xmlhttp=new XMLHttpRequest();
				}
			else
				{// code for IE6, IE5
					xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
				}
			xmlhttp.open("GET","../../layers.xml",false);
			xmlhttp.send();
			xmlDoc=xmlhttp.responseXML; 

			var x=xmlDoc.getElementsByTagName("layer");
			for (i=0;i<x.length;i++)
				{ 
					operationalLayersList: [
						type: x[i].getElementsByTagName("type")[0].childNodes[0].nodeValue,
						url: x[i].getElementsByTagName("url")[0].childNodes[0].nodeValue,
						title: x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
						options: {
							id: x[i].getElementsByTagName("id")[0].childNodes[0].nodeValue,
							opacity: x[i].getElementsByTagName("opacity")[0].childNodes[0].nodeValue,
							visible: x[i].getElementsByTagName("visible")[0].childNodes[0].nodeValue,
						}		
					]				
				}
		},
		*/
		operationalLayers: [
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Model_demo/MapServer",
			title: "Merangin",
			options: {
				id: "Merangin",
				opacity: 1.0,
				visible: true,
			}
		}
		/*
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Merangin_Forestry/MapServer",
			title: "Forestry",
			options: {
				id: "Forestry",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Merangin_Agriculture/MapServer",
			title: "Agriculture",
			options: {
				id: "Agriculture",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Merangin_LandCover/MapServer",
			title: "LandCover",
			options: {
				id: "LandCover",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/AdministrativeMerangin/MapServer",
			title: "Administrative",
			options: {
				id: "Adm Merangin",
				opacity: 1.0,
				visible: true,
				displayLevels: [0, 1, 2, 3, 4, 5, 6, 7],
			}
		},		
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Photovoltaic/MapServer",
			title: "Photovoltaic",
			options: {
				id: "Photovoltaic",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/LandUse/MapServer",
			title: "LandUse",
			options: {
				id: "LandUse",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/LandScapeAnalysis/MapServer",
			title: "LandScapeAnalysis",
			options: {
				id: "LandScapeAnalysis",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/LandCover/MapServer",
			title: "LandCover",
			options: {
				id: "LandCover",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Hidrology/MapServer",
			title: "Hidrology",
			options: {
				id: "Hidrology",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Geology/MapServer",
			title: "Geology",
			options: {
				id: "Geology",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Forestry/MapServer",
			title: "Forestry",
			options: {
				id: "Forestry",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Energy/MapServer",
			title: "Energy",
			options: {
				id: "Energy",
				opacity: 1.0,
				visible: false,
			}
		},
		{
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Climate/MapServer",
			title: "Climate",
			options: {
				id: "Climate",
				opacity: 1.0,
				visible: false,
			}
		},
		{		
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Agriculture/MapServer",
			title: "Agriculture",
			options: {
				id: "Agriculture",
				opacity: 1.0,
				visible: false,
			}
		},
		{		
			type: "dynamic",
			url: "http://117.54.11.70:6080/arcgis/rest/services/mcai/Adminitrative/MapServer",
			title: "Administrative",
			options: {
				id: "Administrative",
				opacity: 1.0,
				visible: false,
			}
		}*/
		],
		//widgets: set include to true or false to load or not load the widget. set position to the desired order, starts at 0 on the top.
		widgets: {
			legend: {
				include: true,
				title: "Legend",
				open: false,
				position: 0
			},
			TOC: {
				include: true,
				title: "Layers",
				open: false,
				position: 1
			},
			bookmarks: {
				include: true,
				title: "District",
				open: false,
				position: 2
			},
			draw: {
				include: true,
				title: "Draw",
				open: false,
				position: 3
			},
			measure: {
				include: true,
				title: "Measurement",
				open: false,
				position: 4,
				defaultAreaUnit: esri.Units.SQUARE_MILES,
				defaultLengthUnit: esri.Units.MILES
			},
			print: {
				include: true,
				title: "Print",
				open: false,
				position: 5,
				serviceURL: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
				copyrightText: "Copyright MCA-I 2014",
				authorText: "MCA-I",
				defaultTitle: 'MILLENNIUM CHALLENGE ACCOUNT-INDONESIA',
				defaultFormat: 'PDF',
				defaultLayout: 'Letter ANSI A Landscape'
			},
			directions: {
				include: false,
				title: "Directions",
				open: false,
				position: 6,
				options: {
					routeTaskUrl: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Route",
					routeParams: {
						directionsLanguage: "en-US",
						directionsLengthUnits: "esriMiles"
					}
				}
			},
			
			landscape: {
				include: true,
				title: "Landscape",
				open: false,
				position: 7				
			},
			editor: {
				include: true,
				title: "Editor",
				open: false,
				position: 7,
				settings: {
					toolbarVisible: true,
					showAttributesOnClick: true,
					enableUndoRedo: true,
					createOptions: {
						polygonDrawTools: ["freehandpolygon", "autocomplete"]
					},
					toolbarOptions: {
						reshapeVisible: true,
						cutVisible: true,
						mergeVisible: true
					}
				}
			},
			scalebar: {
				include: true,
				options: {
					attachTo: "bottom-left",
					scalebarStyle: "line",
					scalebarUnit: "dual"
				}
			}
		}
	};
});