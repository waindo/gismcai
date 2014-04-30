	var app = {}, map, legendLayers = [], toc, dynaLayer1, dynaLayer2, featLayer1;

    require([
      "esri/map",
      "esri/arcgis/utils",
      "esri/InfoTemplate", 
      "esri/dijit/Legend",
	  "esri/dijit/InfoWindowLite",	  
	  "esri/dijit/HomeButton",
      "esri/dijit/Bookmarks",
	  "esri/dijit/Scalebar",
	  "esri/dijit/BasemapGallery", 
      "esri/layers/FeatureLayer",
	  "esri/layers/ArcGISTiledMapServiceLayer", 
	  "esri/layers/ArcGISDynamicMapServiceLayer",
	  "esri/layers/ImageParameters",
	  
	  "esri/symbols/SimpleFillSymbol",
	  "esri/renderers/ClassBreaksRenderer",
	   "esri/geometry/Extent", 
	   
	  "esri/dijit/Print", "esri/tasks/PrintTemplate", 
      "esri/request", "esri/config",
		
	  "dojo/dom-construct",
	  "dojo/dom",      
      "dojo/on",
      "dojo/parser",      
	  "dojo/query",
	  "dojo/_base/array",
      "dojo/_base/connect",
	  "dojo/_base/Color",
	  
	  "dijit/form/CheckBox",
      "dijit/layout/AccordionContainer",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
	  "dijit/TitlePane",
	  "dijit/MenuBar",
      "dijit/PopupMenuBarItem",
      "dijit/Menu",
      "dijit/MenuItem",
      "dijit/DropDownMenu",
	  "esri/dijit/Measurement",
	  
	  "agsjs/dijit/TOC", 
	  
	  "dojo/fx", 
	  "dojo/domReady!"
    ],
      function (
        Map, utils, InfoTemplate, Legend, InfoWindowLite, HomeButton, Bookmarks, Scalebar, BasemapGallery,  
			FeatureLayer, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ImageParameters,  
			SimpleFillSymbol, ClassBreaksRenderer, Extent, Print, PrintTemplate, esriRequest, esriConfig,
		domConstruct, dom, on, parser, query, arrayUtils, connect, Color, 
		CheckBox, AccordionContainer, BorderContainer, ContentPane, 
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, 
		Measurement,
		TOC
      ) {

        parser.parse();
		
		map = new Map("map", {
			basemap: "gray", 
			//extent: new Extent(
			//{"xmin":10297596.450576257,"ymin":-1599674.1279517894,"xmax":16079904.766291732,"ymax":934366.2337577001,"spatialReference":{"wkid":102100}}
			//{"xmin":91.494140625,"ymin":-10.986328125,"xmax":140.4052734375,"ymax":9.755859375,"spatialReference":{"wkid":4326}}
			//),
			//extent: indonesiaZoomLayer.fullExtent,
			logo: false, 
			//nav: true, 
			//fadeOnZoom: true, 
			
			center: [118, -3],
			zoom: 5,
			showAttribution: false,
			sliderPosition: "top-right",
			sliderStyle: "large"
        });
		
		//var basemap = map.getLayer(map.layerIds[0]);
			//basemap.hide();
			
		//add homeButton
		var home = new HomeButton({
			map: map
		}, "HomeButton");
		home.startup();
		
		//add measurement
		var measurement = new Measurement({
          map: map
        }, "measurementDiv");
        measurement.startup();
		
		//add the basemap gallery, in this case we'll display maps from ArcGIS.com including bing maps
        var basemapGallery = new BasemapGallery({
          showArcGISBasemaps: true,
          map: map
        }, "basemapGalleryDiv");
        basemapGallery.startup();
		
		var layer = new esri.dijit.BasemapLayer({
			url:"http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia_blank/MapServer"
		});
		var basemap = new esri.dijit.Basemap({
			layers:[layer],
			title:"None",
			thumbnailUrl:"images/basebandNone.jpg"
		});
		basemapGallery.add(basemap);

		//add scalebar
		var scalebar = new Scalebar({
		map: map,
		scalebarStyle: "ruler",
        attachTo:"bottom-left", 
		scalebarUnit: "dual"
        },dojo.byId("scalebarDiv"));
		
		
		//set featureLayer infoWindows
		var infoTemplate = new InfoTemplate();
		infoTemplate.setTitle("ID : ${ID}");

		indonesiaLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia_blank/MapServer", {
		});
		mcaiLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		districtLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_merangin/MapServer", {
		})
		/*
		districtLayer = new FeatureLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_merangin/MapServer", {
			mode: FeatureLayer.MODE_SNAPSHOT,
            infoTemplate: infoTemplate,
            outFields: [*]
		});
		*/
		landscapeLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_Landscape_analysis/MapServer", {
		});
				
		setPrinter();
		
		//add TOC new layer list
		map.on('layers-add-result', function(evt){
		// overwrite the default visibility of service.
        // TOC will honor the overwritten value.        
		//try {
		toc = new TOC({
			map: map,
			layerInfos: [			
				{
					layer: mcaiLayer,
					title: "MCA - Indonesia", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					//slider: true // whether to display a transparency slider.
				},
				{
					layer: districtLayer,
					title: "District", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					//slider: true // whether to display a transparency slider.
				},
				{
					layer: landscapeLayer,
					title: "Landscape", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					//slider: true // whether to display a transparency slider.
				}
			]}, 'divTOC');
			toc.startup();
			toc.on('load', function(){
                 if (console) 
                    console.log('TOC loaded');
           });
			toc.on('toc-node-checked', function(evt){
				if (console) {
						console.log("TOCNodeChecked, rootLayer:"
						+(evt.rootLayer?evt.rootLayer.id:'NULL')
						+", serviceLayer:"+(evt.serviceLayer?evt.serviceLayer.id:'NULL')
						+ " Checked:"+evt.checked);
						//+ " Checked: false");
				}
			});
		//} catch (e) {  alert(e); }		 
		});
		
		//indonesiaLayer, 
		map.addLayers([mcaiLayer, districtLayer, landscapeLayer]);
		
		
		//event when user click menu item
		on(dom.byId("HomeButton"), "click", FHomeButton);
		
		on(dom.byId("midMuaroJambi"), "click", FmidMuaroJambi);
		on(dom.byId("midMerangin"), "click", FmidMerangin);
		on(dom.byId("midMamuju"), "click", FmidMamuju);
		on(dom.byId("midMamasa"), "click", FmidMamasa);
		
		on(dom.byId("milSungaiTenang"), "click", FmilSungaiTenang);

		
		
		
		
		//all functions
		function hideLayers() {
			mcaiLayer.hide();
			districtLayer.hide();
			landscapeLayer.hide();		
		}
		
		function FHomeButton() {
			hideLayers();
			mcaiLayer.show();
		}
		
		function FmidMuaroJambi() {
			hideLayers();
			districtLayer.setVisibleLayers([49, 76]);
			districtLayer.show();
			
			map.centerAndZoom(esri.geometry.Point([11557890.17294193,-185894.85278953813], 
                  new esri.SpatialReference({ wkid: 102100 })),9);
		}
		function FmidMerangin() {
			hideLayers();
			districtLayer.setVisibleLayers([3, 4, 33]);
			districtLayer.show();
			
			map.centerAndZoom(esri.geometry.Point([11360988.388079325,-245209.9867388319], 
                  new esri.SpatialReference({ wkid: 102100 })),9);
		}
		function FmidMamuju() {
			hideLayers();
						
			map.centerAndZoom(esri.geometry.Point([13279863.546149915,-200570.76222028106], 
                  new esri.SpatialReference({ wkid: 102100 })),8);
		}
		function FmidMamasa() {
			hideLayers();
						
			map.centerAndZoom(esri.geometry.Point([13278640.55369733,-328526.3475696624], 
                  new esri.SpatialReference({ wkid: 102100 })),10);
		}
		
		function FmilSungaiTenang() {
			hideLayers();
			landscapeLayer.setVisibleLayers([1, 2, 4]);
			landscapeLayer.show();
			
			map.centerAndZoom(esri.geometry.Point([11352427.440911409,-282511.2565419838], 
                  new esri.SpatialReference({ wkid: 102100 })),11);
		}
		
		function setPrinter() {
			var printTitle = "MCA - Indonesia"
			var printUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
			esriConfig.defaults.io.proxyUrl = "/mcai_dev/proxy";
			
			var layoutTemplate, templateNames, mapOnlyIndex, templates;
          
          // create an array of objects that will be used to create print templates
			var layouts = [{
				name: "Letter ANSI A Landscape", 
				label: "Landscape (PDF)", 
				format: "pdf",             
			}, {
				name: "Letter ANSI A Portrait", 
				label: "Portrait (Image)", 
				format: "jpg",             
			}];
          
          // create the print templates
			var legendLayer = new esri.tasks.LegendLayer();
			legendLayer.layerId = "defaultBasemap";

			var templates = arrayUtils.map(layouts, function(lo) {
            var t = new PrintTemplate();
            t.layout = lo.name;
            t.label = lo.label;
            t.format = lo.format;
            t.layoutOptions = {
				"authorText": "Made by:  MCA - Indonesia",
				"copyrightText": "Copyright: MCA - Indonesia 2014",
				//"legendLayers": layerIds , 
				"titleText": printTitle, 
				"scalebarUnit": "Kilometers" 
			}
			
            return t;
          });

			var printer = new Print({
				map: map,
				templates: templates,
				url: printUrl
			}, dom.byId("print_button"));
			printer.startup();
		}
      });