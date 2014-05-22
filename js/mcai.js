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
	  "dojo/store/Memory",
	  
	  "dijit/form/CheckBox",
      "dijit/form/ComboBox",
      "dijit/form/RadioButton",
	  "dijit/form/Button",
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
		domConstruct, dom, on, parser, query, arrayUtils, connect, Color, Memory, 
		CheckBox, ComboBox, RadioButton, Button, 
			AccordionContainer, BorderContainer, ContentPane, 
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, 
		Measurement,
		TOC
      ) {

        parser.parse();
		
		map = new Map("map", {
			basemap: "oceans", 
			logo: false, 
			center: [118, -3],
			zoom: 5,
			//showAttribution: false,
			sliderPosition: "top-right",
			//sliderStyle: "large"
			
			//extent: new Extent(
			//{"xmin":10297596.450576257,"ymin":-1599674.1279517894,"xmax":16079904.766291732,"ymax":934366.2337577001,"spatialReference":{"wkid":102100}}
			//{"xmin":91.494140625,"ymin":-10.986328125,"xmax":140.4052734375,"ymax":9.755859375,"spatialReference":{"wkid":4326}}
			//),
			//extent: indonesiaZoomLayer.fullExtent,
			
			//nav: true, 
			//fadeOnZoom: true, 
			
        });
		
		var basemap = map.getLayer(map.layerIds[0]);
			basemap.hide();
		
		setWidget();
		
		//set analysis combo data
		var provinceStore = new Memory({
			data: [
				/*{name:"Aceh", id:"11"},
				{name:"Bali", id:"51"},
				{name:"Banten", id:"36"},
				{name:"Bengkulu", id:"17"},
				{name:"Gorontalo", id:"75"},
				{name:"Jakarta", id:"31"},*/
				{name:"Jambi", id:"15"},
				/*{name:"Jawa Barat", id:"32"},
				{name:"Jawa Tengah", id:"33"},
				{name:"Jawa Timur", id:"35"},
				{name:"Kalimantan Barat", id:"61"},
				{name:"Kalimantan Selatan", id:"63"},
				{name:"Kalimantan Tengah", id:"62"},
				{name:"Kalimantan Timur", id:"64"},
				{name:"Kalimantan Utara", id:"--"},
				{name:"Kepulauan Bangka Belitung", id:"19"},
				{name:"Kepulauan Riau", id:"21"},
				{name:"Lampung", id:"18"},
				{name:"Maluku", id:"81"},
				{name:"Maluku Utara", id:"82"},
				{name:"Nusa Tenggara Barat", id:"52"},
				{name:"Nusa Tenggara Timur", id:"53"},
				{name:"Papua", id:"94"},
				{name:"Papua Barat", id:"91"},
				{name:"Riau", id:"14"},*/
				{name:"Sulawesi Barat", id:"76"},
				/*{name:"Sulawesi Selatan", id:"73"},
				{name:"Sulawesi Tengah", id:"72"},
				{name:"Sulawesi Tenggara", id:"74"},
				{name:"Sulawesi Utara", id:"71"},
				{name:"Sumatera Barat", id:"13"},
				{name:"Sumatera Selatan", id:"16"},
				{name:"Sumatera Utara", id:"12"},
				{name:"Yogyakarta", id:"34"}*/
			]
		});
		var districtStore = new Memory({
			data: [
				{name:"Muaro Jambi", id:"MJ"},
				{name:"Merangin", id:"MN"},
				{name:"Mamuju", id:"MJ"},
				{name:"Mamasa", id:"MS"}
			]
		});
		var landscapeStore = new Memory({
			data: [
				{name:"Sungai Tenang", id:"ST"}
			]
		});
									
		var analysisStore = new Memory({
			data: [
			{name:"Administrative", id:"asAdministrative"},
			{name:"Carbon Project", id:"asCarbonProject"},
			{name:"Climate", id:"asClimate"},
			{name:"Ecology", id:"asEcology"},
			{name:"Energy", id:"asEnergy"},
			{name:"Forestry", id:"asForestry"},
			{name:"Geology", id:"asGeology"},
			{name:"Hazard Vulnerability", id:"asHazardVulnerability"},
			{name:"Hotspot", id:"asHotspot"},
			{name:"Hidrology", id:"asHidrology"},
			{name:"Infrastructure", id:"asInfrastucture"},
			{name:"Landcover", id:"asLandcover"},
			{name:"Land Degradation", id:"asLandDegradation"},
			{name:"Landpermit", id:"asLandpermit"},
			{name:"Landscape", id:"asLandscape"},			
			{name:"Landuse Spatial Plan", id:"asLanduseSpatialPlan"},
			{name:"Mining", id:"asMining"},
			{name:"Strategic Issue", id:"asStrategicIssue"},
			{name:"Sosio Economic", id:"asSosioEconomic"},
			{name:"Soil", id:"asSoil"},
			{name:"Topography", id:"asTopography"},
			{name:"Microhydro", id:"asMicrohydro"},
			{name:"Photovoltaic", id:"asPhotovoltaic"}
			]
		});
		
		var radioProvince = new RadioButton({
			checked: true,
			value: "province",
			name: "rbAnalysis",
		}, "radioProvince");
		var radioDistrict = new RadioButton({
			checked: false,
			value: "district",
			name: "rbAnalysis",
		}, "radioDistrict");
		var radioLandscape = new RadioButton({
			checked: false,
			value: "landscape",
			name: "rbAnalysis",
		}, "radioLandscape");
		
		var comboBox = new ComboBox({
			id: "provinceSelect",
			name: "province",
			value: "-----",
			store: provinceStore,
			searchAttr: "name"
		}, "provinceSelect");
		var comboBox = new ComboBox({
			id: "districtSelect",
			name: "district",
			value: "-----",
			store: districtStore,
			searchAttr: "name"
		}, "districtSelect");
		var comboBox = new ComboBox({
			id: "landscapeSelect",
			name: "landscape",
			value: "-----",
			store: landscapeStore,
			searchAttr: "name"
		}, "landscapeSelect");
		var comboBox = new ComboBox({
			id: "analysisSelect",
			name: "analysis",
			value: "-----",
			store: analysisStore,
			searchAttr: "name"
		}, "analysisSelect");
		
		var analysisButton = new Button({
			label: "Analysis",
			//onClick: fAnalysis(),
		}, "analysisButton");
		fComboDisable();
		dijit.byId("provinceSelect").attr("disabled", false);
		
		//set featureLayer infoWindows
		var infoTemplate = new InfoTemplate();
		var testing;
		
		infoTemplate.setTitle("Sub District");
		infoTemplate.setContent(
		"<table border=0 width=100%>" +
			"<tr>" + 
				"<td valign=top width=74><font face=Arial size=2>Name</font></td>" +
				" <td><font face=Arial size=2>: ${ibukota_ke}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td valign=top width=74><font face=Arial size=2>Hectares</font></td>" +
				"<td><font face=Arial size=2>: ${hectares:NumberFormat}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td valign=top width=74><font face=Arial size=2>Function</font></td>" +
				"<td><font face=Arial size=2>: ${wp}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td colspan=2><font face=Arial size=2>${ibukota_ke:getFile}</font></td>" +
			"</tr>" +
		"</table>" 
		);
		getFile = function(value, key, data) {
			var result = ""
			
			switch(key) {
				case "ibukota_ke": 
					if (data.ibukota_ke == "Rantau Suli") {
						result = "<a href=http://localhost/mcai_dev/detail/Intervention.htm target=_blank " ;
						result = result + "onclick = window.open('','More Detail',";
						result = result + "'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500px,height=300px');return false";
						result = result + "><i>More Detail</i></a>";
					}					
					break;
			}
			console.log(result);
			return result
			
		}
		
		indonesiaBackgroundLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Indonesia_Background/MapServer", {
		});
		indonesiaLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		mcaiLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		provinceLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Province/MapServer", {
		});
		districtLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/District/MapServer", {
		});
		
		subDistrictMeranginFeatureLayer = new FeatureLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_merangin/MapServer/4", {
			mode: FeatureLayer.MODE_SNAPSHOT,
            infoTemplate: infoTemplate,
			opacity: 0,
            outFields: ["*"]
		});
		
		landscapeLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Landscape/MapServer", {
		//landscapeLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_Landscape_analysis/MapServer", {
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
					slider: true // whether to display a transparency slider.
				},
				{
					layer: provinceLayer,
					title: "Province", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					slider: true // whether to display a transparency slider.
				},
				{
					layer: districtLayer,
					title: "District", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					slider: true // whether to display a transparency slider.
				},
				{
					layer: landscapeLayer,
					title: "Landscape", 
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					slider: true // whether to display a transparency slider.
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
		map.addLayers([
			indonesiaBackgroundLayer, 
			mcaiLayer, 
			provinceLayer, 
			districtLayer, 
				subDistrictMeranginFeatureLayer,
				landscapeLayer			
			]);
		hideLayers();
		mcaiLayer.show();
		
		//even form analysis
		on(dom.byId("analysisButton"), "click", fAnalysis);
		
		//event when user click menu item
		on(dom.byId("HomeButton"), "click", FHomeButton);
		
		on(dom.byId("midMuaroJambi"), "click", FmidMuaroJambi);
		on(dom.byId("midMerangin"), "click", FmidMerangin);
		on(dom.byId("midMamuju"), "click", FmidMamuju);
		on(dom.byId("midMamasa"), "click", FmidMamasa);
		
		on(dom.byId("milSungaiTenang"), "click", FmilSungaiTenang);

		//event when user click analysis menu
		on(dom.byId("radioProvince"), "click", fRadioProvince);
		on(dom.byId("radioDistrict"), "click", fRadioDistrict);
		on(dom.byId("radioLandscape"), "click", fRadioLandscape);
		on(dom.byId("btnSubmit"), "click", fAnalysis);
		
		
		
		//all functions
		function setWidget() {
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
				url:"http://localhost:6080/arcgis/rest/services/MCA_I/Indonesia_Blank/MapServer"
				//url:"http://services.arcgisonline.com/ArcGIS/services"
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
		}
		
		function fAnalysis() {
			var iArea, iSelectArea, iSelectAnalysis;
			
			if (dom.byId("radioProvince").checked && dijit.byId("provinceSelect").get("value") != "-----" ) {
				iSelectArea = dijit.byId("provinceSelect").get("value").trim();
				iArea="1";
			};
			if (dom.byId("radioDistrict").checked && dijit.byId("districtSelect").get("value") != "-----" ) {
				iSelectArea = dijit.byId("districtSelect").get("value").trim();
				iArea="2";
			};
			if (dom.byId("radioLandscape").checked && dijit.byId("landscapeSelect").get("value") != "-----" ) {
				iSelectArea = dijit.byId("landscapeSelect").get("value").trim();
				iArea="3";
			};
			
			iSelectAnalysis = dijit.byId("analysisSelect").get("value").trim();
			
			if (iArea != null) {
				mcaiLayer.hide();
				districtLayer.hide();
				landscapeLayer.hide();
			}
			
			//analisa untuk propinsi
			if (iArea == 1) {
				hideLayers();
				
				//cek nama landscape
				switch (iSelectArea)
				{
					case 'Jambi':
						map.centerAndZoom(esri.geometry.Point([11462191.013528507,-185007.200276374], 
							new esri.SpatialReference({ wkid: 102100 })),8);
							
					//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': provinceLayer.setVisibleLayers([4, 5]); break;
							case 'Agriculture': provinceLayer.setVisibleLayers([4, 5, 13]); break;
							case 'Carbon Project': provinceLayer.setVisibleLayers([4, 5, 19]); break;
							case 'Climate': provinceLayer.setVisibleLayers([4, 5, 21, 22]); break;
							case 'Ecology': provinceLayer.setVisibleLayers([4, 5, 23, 33]); break;
							case 'Energy': provinceLayer.setVisibleLayers([4, 5, 35, 36]); break;
							case 'Forestry': provinceLayer.setVisibleLayers([4, 5, 37, 38]); break;
							case 'Hazard Vulnerability': provinceLayer.setVisibleLayers([4, 5, 48, 49]); break;
							case 'Hotspot': provinceLayer.setVisibleLayers([4, 5, 53, 54]); break;
							case 'Hidrology': provinceLayer.setVisibleLayers([4, 5, 55, 57, 58]); break;
							//case 'Geology': provinceLayer.setVisibleLayers([4, 567, 68]); break;
							case 'Infrastructure': provinceLayer.setVisibleLayers([4, 5, 60, 61]); break;
							case 'Landcover': provinceLayer.setVisibleLayers([4, 5, 63, 64]); break;
							case 'Land Degradation': provinceLayer.setVisibleLayers([4, 5, 66, 67]); break;
							//case 'Landpermit': provinceLayer.setVisibleLayers([4, 5 77]); break;
							//case 'Landuse': provinceLayer.setVisibleLayers([4, 5 79]); break;
							case 'Mining': provinceLayer.setVisibleLayers([4, 5, 69, 70]); break;
							case 'Permits': provinceLayer.setVisibleLayers([4, 5, 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': provinceLayer.setVisibleLayers([4, 5, 81, 82]); break;
							//case 'Strategic Issue': provinceLayer.setVisibleLayers([4, 5 85]); break;
							case 'Sosio Economic': provinceLayer.setVisibleLayers([4, 5, 83, 85]); break;
							case 'Soil': provinceLayer.setVisibleLayers([4, 5, 86, 88]); break;
							case 'Topography': provinceLayer.setVisibleLayers([4, 5, 89, 90]); break;
							default : provinceLayer.setVisibleLayers([4, 5]); break;
						}
						break;
						
					case 'Sulawesi Barat':
						map.centerAndZoom(esri.geometry.Point([13290258.981996706,-251660.28894105682], 
							new esri.SpatialReference({ wkid: 102100 })),8);
							
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': provinceLayer.setVisibleLayers([92, 95, 96]); break;
							//case 'Agriculture': provinceLayer.setVisibleLayers([92, 95, 96, 7, 8, 9, 10, 11, 12, 13]); break;
							//case 'Carbon Project': provinceLayer.setVisibleLayers([92, 95, 96, 14, 15, 16, 17, 18, 19, 20]); break;
							case 'Climate': provinceLayer.setVisibleLayers([92, 95, 96, 98, 99]); break;
							//case 'Ecology': provinceLayer.setVisibleLayers([92, 95, 96, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]); break;
							case 'Energy': provinceLayer.setVisibleLayers([92, 95, 96, 100, 101, 102, 103]); break;
							case 'Forestry': provinceLayer.setVisibleLayers([92, 95, 96, 104, 105, 106]); break;							
							case 'Hazard Vulnerability': provinceLayer.setVisibleLayers([92, 95, 96, 107, 110, 111]); break;
							case 'Hotspot': provinceLayer.setVisibleLayers([92, 95, 96, 112, 113]); break;
							case 'Hidrology': provinceLayer.setVisibleLayers([92, 95, 96, 114, 115, 116]); break;
							//case 'Geology': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							case 'Infrastructure': provinceLayer.setVisibleLayers([92, 95, 96, 118, 120]); break;
							case 'Landcover': provinceLayer.setVisibleLayers([92, 95, 96, 122, 123]); break;
							//case 'Land Degradation': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							//case 'Landpermit': provinceLayer.setVisibleLayers([92, 95, 96, 77]); break;
							//case 'Landuse': provinceLayer.setVisibleLayers([92, 95, 96, 79]); break;
							//case 'Mining': provinceLayer.setVisibleLayers([92, 95, 96, 69, 70, 71]); break;
							//case 'Permits': provinceLayer.setVisibleLayers([92, 95, 96, 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': provinceLayer.setVisibleLayers([92, 95, 96, 124, 125]); break;
							//case 'Strategic Issue': provinceLayer.setVisibleLayers([92, 95, 96, 85]); break;
							//case 'Sosio Economic': provinceLayer.setVisibleLayers([92, 95, 96, 83, 84, 85]); break;
							case 'Soil': provinceLayer.setVisibleLayers([92, 95, 96, 126, 128]); break;
							case 'Topography': provinceLayer.setVisibleLayers([92, 95, 96, 129, 130]); break;
							default : provinceLayer.setVisibleLayers([92, 95, 96]); break;
						}
						break;
				}
				provinceLayer.show();
				
			}
			
			//analisa untuk district
			if (iArea == 2) {
				hideLayers();
				
				//cek nama district
				switch (iSelectArea)
				{
					case 'Muaro Jambi':
						map.centerAndZoom(esri.geometry.Point([11557890.17294193,-185894.85278953813], 
							new esri.SpatialReference({ wkid: 102100 })),9);
						
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': districtLayer.setVisibleLayers([67, 69]); break;
							case 'Agriculture': districtLayer.setVisibleLayers([67, 69, 71, 72, 73, 74, 75]); break;
							//case 'Carbon Project': districtLayer.setVisibleLayers([67, 69, 76, 77,78]); break;
							case 'Climate': districtLayer.setVisibleLayers([67, 69, 76, 78]); break;
							//case 'Ecology': districtLayer.setVisibleLayers([67, 69, 19, 20, 21, 22, 23, 24, 25, 26, 27]); break;
							case 'Energy': districtLayer.setVisibleLayers([67, 69, 79, 80, 81]); break;
							case 'Forestry': districtLayer.setVisibleLayers([67, 69, 82, 86]); break;							
							case 'Geology': districtLayer.setVisibleLayers([67, 69, 87, 88, 89]); break;
							//case 'Hazard Vulnerability': districtLayer.setVisibleLayers([67, 69, 107, 108, 109, 110, 111]); break;
							//case 'Hotspot': districtLayer.setVisibleLayers([67, 69, 112, 113]); break;
							case 'Hidrology': districtLayer.setVisibleLayers([67, 69, 90, 91]); break;							
							case 'Infrastructure': districtLayer.setVisibleLayers([67, 69, 92]); break;
							case 'Landcover': districtLayer.setVisibleLayers([67, 69, 98, 99]); break;
							//case 'Land Degradation': districtLayer.setVisibleLayers([67, 69, 66, 67, 68]); break;
							case 'Landpermit': districtLayer.setVisibleLayers([67, 69, 93, 94]); break;
							case 'Landscape': districtLayer.setVisibleLayers([67, 69, 95, 96]); break;
							//case 'Landuse': districtLayer.setVisibleLayers([67, 69, 79]); break;
							case 'Mining': districtLayer.setVisibleLayers([67, 69, 100, 101]); break;
							//case 'Permits': districtLayer.setVisibleLayers([67, 69, 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': districtLayer.setVisibleLayers([67, 69, 102, 103]); break;
							case 'Strategic Issue': districtLayer.setVisibleLayers([67, 69, 104, 105]); break;
							//case 'Sosio Economic': districtLayer.setVisibleLayers([67, 69, 83, 84, 85]); break;
							//case 'Soil': districtLayer.setVisibleLayers([67, 69, 126, 127, 128]); break;
							case 'Topography': districtLayer.setVisibleLayers([67, 69, 106, 108]); break;
							default : districtLayer.setVisibleLayers([67, 69]); break;
						}
						break;
						
					case 'Merangin':
						map.centerAndZoom(esri.geometry.Point([11360988.388079325,-245209.9867388319], 
							new esri.SpatialReference({ wkid: 102100 })),9);
						
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': districtLayer.setVisibleLayers([1, 4, 5 ]); break;
							case 'Agriculture': districtLayer.setVisibleLayers([1, 4, 5, 7, 8, 9, 10, 11, 12]); break;
							case 'Carbon Project': districtLayer.setVisibleLayers([1, 4, 5, 13, 14]); break;
							case 'Climate': districtLayer.setVisibleLayers([1, 4, 5, 15, 17]); break;
							case 'Ecology': districtLayer.setVisibleLayers([1, 4, 5, 19, 27]); break;
							case 'Energy': districtLayer.setVisibleLayers([1, 4, 5, 28, 29, 30, 31]); break;
							case 'Forestry': districtLayer.setVisibleLayers([1, 4, 5, 32, 33, 38]); break;							
							case 'Geology': districtLayer.setVisibleLayers([1, 4, 5, 39, 40, 41]); break;
							//case 'Hazard Vulnerability': districtLayer.setVisibleLayers([1, 4, 5 107, 108, 109, 110, 111]); break;
							//case 'Hotspot': districtLayer.setVisibleLayers([1, 4, 5 112, 113]); break;
							case 'Hidrology': districtLayer.setVisibleLayers([1, 4, 5, 42, 43]); break;							
							case 'Infrastructure': districtLayer.setVisibleLayers([1, 4, 5, 46, 47]); break;
							case 'Landcover': districtLayer.setVisibleLayers([1, 4, 5, 53, 54]); break;
							//case 'Land Degradation': districtLayer.setVisibleLayers([1, 4, 5 66, 67, 68]); break;
							case 'Landpermit': districtLayer.setVisibleLayers([1, 4, 5, 48, 49]); break;
							case 'Landscape': districtLayer.setVisibleLayers([1, 4, 5, 50, 51, 52]); break;
							//case 'Landuse': districtLayer.setVisibleLayers([1, 4, 5 79]); break;
							case 'Mining': districtLayer.setVisibleLayers([1, 4, 5, 55, 56]); break;
							//case 'Permits': districtLayer.setVisibleLayers([1, 4, 5 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': districtLayer.setVisibleLayers([1, 4, 5, 57, 58]); break;
							case 'Strategic Issue': districtLayer.setVisibleLayers([1, 4, 5, 59, 60, 61]); break;
							//case 'Sosio Economic': districtLayer.setVisibleLayers([1, 4, 5 83, 84, 85]); break;
							//case 'Soil': districtLayer.setVisibleLayers([1, 4, 5 126, 127, 128]); break;
							case 'Topography': districtLayer.setVisibleLayers([1, 4, 5, 62, 64]); break;
							default : districtLayer.setVisibleLayers([1, 4, 5]); break;
						}	
						break;
					
					case 'Mamuju':
						map.centerAndZoom(esri.geometry.Point([13279863.546149915,-200570.76222028106], 
							new esri.SpatialReference({ wkid: 102100 })),8);
						//map.centerAndZoom(esri.geometry.Point([13290258.981996706,-251660.28894105682], 
							//new esri.SpatialReference({ wkid: 102100 })),8);
						
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': provinceLayer.setVisibleLayers([92, 95, 96]); break;
							//case 'Agriculture': provinceLayer.setVisibleLayers([92, 95, 96, 7, 8, 9, 10, 11, 12, 13]); break;
							//case 'Carbon Project': provinceLayer.setVisibleLayers([92, 95, 96, 14, 15, 16, 17, 18, 19, 20]); break;
							case 'Climate': provinceLayer.setVisibleLayers([92, 95, 96, 98, 99]); break;
							//case 'Ecology': provinceLayer.setVisibleLayers([92, 95, 96, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]); break;
							case 'Energy': provinceLayer.setVisibleLayers([92, 95, 96, 100, 101, 102, 103]); break;
							case 'Forestry': provinceLayer.setVisibleLayers([92, 95, 96, 104, 105, 106]); break;							
							case 'Hazard Vulnerability': provinceLayer.setVisibleLayers([92, 95, 96, 107, 110, 111]); break;
							case 'Hotspot': provinceLayer.setVisibleLayers([92, 95, 96, 112, 113]); break;
							case 'Hidrology': provinceLayer.setVisibleLayers([92, 95, 96, 114, 115, 116]); break;
							//case 'Geology': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							case 'Infrastructure': provinceLayer.setVisibleLayers([92, 95, 96, 118, 120]); break;
							case 'Landcover': provinceLayer.setVisibleLayers([92, 95, 96, 122, 123]); break;
							//case 'Land Degradation': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							//case 'Landpermit': provinceLayer.setVisibleLayers([92, 95, 96, 77]); break;
							//case 'Landuse': provinceLayer.setVisibleLayers([92, 95, 96, 79]); break;
							//case 'Mining': provinceLayer.setVisibleLayers([92, 95, 96, 69, 70, 71]); break;
							//case 'Permits': provinceLayer.setVisibleLayers([92, 95, 96, 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': provinceLayer.setVisibleLayers([92, 95, 96, 124, 125]); break;
							//case 'Strategic Issue': provinceLayer.setVisibleLayers([92, 95, 96, 85]); break;
							//case 'Sosio Economic': provinceLayer.setVisibleLayers([92, 95, 96, 83, 84, 85]); break;
							case 'Soil': provinceLayer.setVisibleLayers([92, 95, 96, 126, 128]); break;
							case 'Topography': provinceLayer.setVisibleLayers([92, 95, 96, 129, 130]); break;
							default : provinceLayer.setVisibleLayers([92, 95, 96]); break;
						}	
						break;
						
					case 'Mamasa':
						map.centerAndZoom(esri.geometry.Point([13278640.55369733,-328526.3475696624], 
							new esri.SpatialReference({ wkid: 102100 })),10);
						//map.centerAndZoom(esri.geometry.Point([13290258.981996706,-251660.28894105682], 
							//new esri.SpatialReference({ wkid: 102100 })),8);
						
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': provinceLayer.setVisibleLayers([92, 95, 96]); break;
							//case 'Agriculture': provinceLayer.setVisibleLayers([92, 95, 96, 7, 8, 9, 10, 11, 12, 13]); break;
							//case 'Carbon Project': provinceLayer.setVisibleLayers([92, 95, 96, 14, 15, 16, 17, 18, 19, 20]); break;
							case 'Climate': provinceLayer.setVisibleLayers([92, 95, 96, 98, 99]); break;
							//case 'Ecology': provinceLayer.setVisibleLayers([92, 95, 96, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]); break;
							case 'Energy': provinceLayer.setVisibleLayers([92, 95, 96, 100, 101, 102, 103]); break;
							case 'Forestry': provinceLayer.setVisibleLayers([92, 95, 96, 104, 105, 106]); break;							
							case 'Hazard Vulnerability': provinceLayer.setVisibleLayers([92, 95, 96, 107, 110, 111]); break;
							case 'Hotspot': provinceLayer.setVisibleLayers([92, 95, 96, 112, 113]); break;
							case 'Hidrology': provinceLayer.setVisibleLayers([92, 95, 96, 114, 115, 116]); break;
							//case 'Geology': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							case 'Infrastructure': provinceLayer.setVisibleLayers([92, 95, 96, 118, 120]); break;
							case 'Landcover': provinceLayer.setVisibleLayers([92, 95, 96, 122, 123]); break;
							//case 'Land Degradation': provinceLayer.setVisibleLayers([92, 95, 96, 66, 67, 68]); break;
							//case 'Landpermit': provinceLayer.setVisibleLayers([92, 95, 96, 77]); break;
							//case 'Landuse': provinceLayer.setVisibleLayers([92, 95, 96, 79]); break;
							//case 'Mining': provinceLayer.setVisibleLayers([92, 95, 96, 69, 70, 71]); break;
							//case 'Permits': provinceLayer.setVisibleLayers([92, 95, 96, 72, 73, 74, 75, 76, 77, 78, 79, 80]); break;
							case 'Landuse Spatial Plan': provinceLayer.setVisibleLayers([92, 95, 96, 124, 125]); break;
							//case 'Strategic Issue': provinceLayer.setVisibleLayers([92, 95, 96, 85]); break;
							//case 'Sosio Economic': provinceLayer.setVisibleLayers([92, 95, 96, 83, 84, 85]); break;
							case 'Soil': provinceLayer.setVisibleLayers([92, 95, 96, 126, 128]); break;
							case 'Topography': provinceLayer.setVisibleLayers([92, 95, 96, 129, 130]); break;
							default : provinceLayer.setVisibleLayers([92, 95, 96]); break;
						}	
						break;
				}
				
				switch (iSelectArea) {
					case "Mamuju" :
						provinceLayer.show();break;
					case "Mamasa" :
						provinceLayer.show();break;
					default : districtLayer.show();break;
				}
			}
			
			//analisa untuk landscape
			if (iArea == 3) {
				hideLayers();
				
				//cek nama landscape
				switch (iSelectArea)
				{
					case 'Sungai Tenang':
						map.centerAndZoom(esri.geometry.Point([11352427.440911409,-282511.2565419838], 
							new esri.SpatialReference({ wkid: 102100 })),11); 
						
						//cek jenis analisa
						switch (iSelectAnalysis)
						{
							case 'Administrative': landscapeLayer.setVisibleLayers([1]); break;
							case 'Microhydro': landscapeLayer.setVisibleLayers([1, 2, 5, 7]); break;
							case 'Photovoltaic': landscapeLayer.setVisibleLayers([1, 13]); break;
							default : landscapeLayer.setVisibleLayers([1]); break;
						}
				}
				landscapeLayer.show();
			}
			
			//alert(iSelectArea);
			//alert(iSelectAnalysis);
			
			//landscapeLayer.setVisibleLayers([1, 4]);
			
			//map.removeLayer(landscapeLayer);
			
		}
		function fRadioProvince() {
			fComboDisable();
			
			dijit.byId("provinceSelect").attr("disabled", false);			
		}
		function fRadioDistrict() {
			fComboDisable();
			
			dijit.byId("districtSelect").attr("disabled", false);			
		}
		function fRadioLandscape() {
			fComboDisable();
			
			dijit.byId("landscapeSelect").attr("disabled", false);			
		}
		function fComboDisable() {
			dijit.byId("provinceSelect").set("value","-----");
			dijit.byId("districtSelect").set("value","-----");
			dijit.byId("landscapeSelect").set("value","-----");
			
			dijit.byId("provinceSelect").attr("disabled", true);
			dijit.byId("districtSelect").attr("disabled", true);
			dijit.byId("landscapeSelect").attr("disabled", true);
		}
		
		function hideLayers() {
			mcaiLayer.hide();
			provinceLayer.hide();
			districtLayer.hide();
			landscapeLayer.hide();
			
			//set all feature layer hide
			//subDistrictMeranginFeatureLayer.hide
			//map.removeLayer(landscapeLayer);
			
		}
		
		function FHomeButton() {
			hideLayers();
			mcaiLayer.show();
			
			fComboDisable();
			dijit.byId("analysisSelect").set("value","-----");
			dijit.byId("provinceSelect").attr("disabled", false);
			dijit.byId("radioProvince").attr("checked", true);
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
			subDistrictMeranginFeatureLayer.show();

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
			landscapeLayer.setVisibleLayers([1, 4]);
			landscapeLayer.show();
			
			map.centerAndZoom(esri.geometry.Point([11352427.440911409,-282511.2565419838], 
                  new esri.SpatialReference({ wkid: 102100 })),11);
		}
		
		function setPrinter() {
			var printTitle = "MCA - Indonesia"
			//var printUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
			var printUrl = "http://localhost:6080/arcgis/rest/services/MCAI/ExportWebMap/GPServer";
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
			var iDiclamer ="";
			iDiclamer = iDiclamer + "Disclaimer/Use limitations \n "
			iDiclamer = iDiclamer + "MCA-I makes no warranty, expressed or implied, as to the use or appropriateness of use of the data, \n "
			iDiclamer = iDiclamer + "nor are there warranties of merchantability or fitness for a particular purpose or use. "
			iDiclamer = iDiclamer + "No representation is made as to the currency, accuracy or completeness of the data set or \n "
			iDiclamer = iDiclamer + "of the data sources on which it is based. MCA-I shall not be liable for any lost profits or \n "
			iDiclamer = iDiclamer + "consequential damages, or claims against the user by third parties. \n \n "
			iDiclamer = iDiclamer + "Copyright: MCA - Indonesia 2014"
			
			var templates = arrayUtils.map(layouts, function(lo) {
            var t = new PrintTemplate();
            t.layout = lo.name;
            t.label = lo.label;
            t.format = lo.format;
            t.layoutOptions = {
				"authorText": "Made by:  MCA - Indonesia",
				"copyrightText": iDiclamer,
				"customTextElements": [],
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
	  