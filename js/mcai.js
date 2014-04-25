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
        Map, utils, InfoTemplate, Legend, InfoWindowLite, HomeButton, Bookmarks, Scalebar,FeatureLayer, 
			ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ImageParameters,  
			SimpleFillSymbol, ClassBreaksRenderer, Extent, Print, PrintTemplate, esriRequest, esriConfig,
		domConstruct, dom, on, parser, query, arrayUtils, connect, Color, 
		CheckBox, AccordionContainer, BorderContainer, ContentPane, 
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, 
		Measurement,
		TOC
      ) {

        parser.parse();
		
		map = new Map("map", {
			basemap: "topo", 
			//extent: new Extent(
			//{"xmin":10297596.450576257,"ymin":-1599674.1279517894,"xmax":16079904.766291732,"ymax":934366.2337577001,"spatialReference":{"wkid":102100}}
			//{"xmin":91.494140625,"ymin":-10.986328125,"xmax":140.4052734375,"ymax":9.755859375,"spatialReference":{"wkid":4326}}
			//),
			center: [-240, -2],
			zoom: 5,
			showAttribution: false,
			sliderPosition: "top-right",
			sliderStyle: "large"
        });

		var basemap = map.getLayer(map.layerIds[0]);
			basemap.hide();
			
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
		
		//add scalebar
		var scalebar = new Scalebar({
		map: map,
		scalebarStyle: "ruler",
        attachTo:"bottom-left", 
		scalebarUnit: "dual"
        },dojo.byId("scalebarDiv"));
		
		indonesiaLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia_blank/MapServer", {
		});
		mcaiLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		d_meranginLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_merangin/MapServer", {
		});
		landscapeLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_Landscape_analysis/MapServer", {
		});
		
		//addMCAILayers();
		isiBookmarks();
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
					layer: d_meranginLayer,
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
		
		map.addLayers([indonesiaLayer, mcaiLayer, d_meranginLayer, landscapeLayer]);
		
		//all functions
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
		
		
		
		
		function isiBookmarks(){
			// Bookmarks can be specified as an array of objects with the structure:
			// { extent: <esri.geometry.Extent>, name: <some string> }
			var bookmarks_list = [
			{
			  "extent":    {"xmin":11331789.443274448,"ymin":-278842.2791843226,"xmax":11749441.365824448,"ymax":-88666.95281089576,"spatialReference":{"wkid":102100}}
			  ,"name": "Muaro Jambi" 
			},
			{
			  "extent":   {"xmin":11138098.013599884,"ymin":-344883.87162266456,"xmax":11555749.936149884,"ymax":-154708.54524923777,"spatialReference":{"wkid":102100}}
			  ,"name": "Merangin" 
			},
			{
			  "extent":   {"xmin":12865880.600957407,"ymin":-415817.43387136597,"xmax":13701184.446057772,"ymax":-35466.78112434782,"spatialReference":{"wkid":102100}}
				,"name": "Mamuju" 
			},
			{
			  "extent":    {"xmin":13180648.283435678,"ymin":-381573.64519963,"xmax":13389474.24471086,"ymax":-286485.98201283434,"spatialReference":{"wkid":102100}}
				,"name": "Mamasa" 
			}
			];

			var bookmarks_landscape = [{
			  "extent":  {"xmin":11326477.06980866,"ymin":-297187.16597275843,"xmax":11378683.560127364,"ymax":-273415.25017610064,"spatialReference":{"wkid":102100}}
			  ,"name": "Sungai Tenang" 
			}];
			
			// Create the bookmark widget
			bookmarks = new esri.dijit.Bookmarks({
			  map: map, 
			  bookmarks: bookmarks_list
			}, dojo.byId('bookmarks'));
			
			bookmarksLandscape = new esri.dijit.Bookmarks({
			  map: map, 
			  bookmarks: bookmarks_landscape
			}, dojo.byId('bookmarksLandscape'));
		}
      });