var app = {}, map, toc, dynaLayer1, dynaLayer2, featLayer1;
var legendAgriculture = [], legendCarbonProject = [], legendClimate = [], legendEcology = [], legendEnergy = [];
var legendForestry = [], legendHazardVunerabillity = [], legendHotspot = [], legendHydrology = [];
var legendInfrastructure = [], legendLandcover = [], legendLandDegradation = [], legendMining = [];
var legendPermits = [], legendLanduseSpatialPlan = [], legendSocioEconomic = [], legendSoil = [];
var legendLayers = [], legendTopography = [], legendRainFalls = [], legendAdministrative = [];
var legendLandscape = [];

var iAlamatLokal = "localhost";
var iMapServicesFolder = "http://" + iAlamatLokal + ":6080/arcgis/rest/services/data/";
var iFeatureFolder = iMapServicesFolder + "indonesia3/MapServer/";

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
	"esri/layers/LabelLayer",
  
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
	"esri/symbols/TextSymbol",
	
	"esri/renderers/ClassBreaksRenderer",
	"esri/renderers/SimpleRenderer",
	
	"esri/geometry/Extent", 
	"esri/toolbars/navigation",
	
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
	"dijit/form/HorizontalSlider",
	"dijit/layout/AccordionContainer",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/TitlePane",
	"dijit/MenuBar",
	"dijit/PopupMenuBarItem",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/DropDownMenu",
	"dijit/layout/TabContainer",
	"dijit/Toolbar",
	"dijit/registry",
	"esri/dijit/Measurement",
	
  
	"agsjs/dijit/TOC", 
  
	"dojo/fx", 
	"dojo/domReady!"
	],
	function (
		Map, utils, InfoTemplate, Legend, InfoWindowLite, HomeButton, Bookmarks, Scalebar, BasemapGallery,  
			FeatureLayer, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ImageParameters,  LabelLayer, 
			SimpleLineSymbol, SimpleFillSymbol, TextSymbol, ClassBreaksRenderer, SimpleRenderer, 
			Extent, Navigation, Print, PrintTemplate, esriRequest, esriConfig,
		domConstruct, dom, on, parser, query, arrayUtils, connect, Color, Memory, 
		CheckBox, ComboBox, RadioButton, Button, HorizontalSlider, 
			AccordionContainer, BorderContainer, ContentPane, 
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, TabContainer, Toolbar, registry,
		Measurement,
		TOC
	) {
		parser.parse();
		var navToolbar;

		esriConfig.defaults.io.proxyUrl = "/mcai_dev/proxy";
		loading = dojo.byId("loadingImg");
		
		map = new Map("map", {
			basemap: "oceans", 	
			logo: false, 
			center: [118, -3],
			zoom: 5,
			showAttribution: false,
			sliderPosition: "top-right",
			sliderStyle: "large"
		});
		//hide the default basemap 
		//var basemap = map.getLayer(map.layerIds[0]);
		//basemap.hide();
		
		//set for loading gif
		
		//dojo.connect(map, "onUpdateStart", fShowLoading);
        //dojo.connect(map, "onUpdateEnd", fHideLoading);
		
		
  
		fLoadAllLayers();
		fAddLabelLayers();
		fHideAllFeatureLayers();	
		fSetLegend();		
		fKosongDiv();
		fAddCategoryGroup();
		
		fLoadWidgets();
		fSetPrinter();
		fLoadAreaList();
		fLoadZoomTo();

		//event when user content pane
		on(dom.byId("HomeButton"), "click", fHomeButton);
		
		/*
		on(dom.byId("radioProvince"), "click", fRadioProvince);
		on(dom.byId("radioDistrict"), "click", fRadioDistrict);
		on(dom.byId("radioLandscape"), "click", fRadioLandscape);
		*/
		
		on(dom.byId("radioProvinceZT"), "click", fRadioProvinceZT);
		on(dom.byId("radioDistrictZT"), "click", fRadioDistrictZT);
		on(dom.byId("radioLandscapeZT"), "click", fRadioLandscapeZT);
		
		//on(dom.byId("processButton"), "click", fProcess);
		on(dom.byId("zoomToButton"), "click", fZoomTo);
		
		navToolbar = new Navigation(map);
          on(navToolbar, "onExtentHistoryChange", extentHistoryChangeHandler);

          registry.byId("zoomin").on("click", function () {
            navToolbar.activate(Navigation.ZOOM_IN);
          });

          registry.byId("zoomout").on("click", function () {
            navToolbar.activate(Navigation.ZOOM_OUT);
          });

          //registry.byId("zoomfullext").on("click", function () {
          //  navToolbar.zoomToFullExtent();
          //});

          registry.byId("zoomprev").on("click", function () {
            navToolbar.zoomToPrevExtent();
          });

          registry.byId("zoomnext").on("click", function () {
            navToolbar.zoomToNextExtent();
          });

          registry.byId("pan").on("click", function () {
            navToolbar.activate(Navigation.PAN);
          });

          registry.byId("deactivate").on("click", function () {
            navToolbar.deactivate();
          });

	//------------------------
	//-- all functions --
	//------------------------
	function extentHistoryChangeHandler () {
        registry.byId("zoomprev").disabled = navToolbar.isFirstExtent();
		registry.byId("zoomnext").disabled = navToolbar.isLastExtent();
    }
		  
	function fSetPrinter() {
			var printTitle = "MCA - Indonesia"
			var printUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
			esriConfig.defaults.io.proxyUrl = "/proxy";
			
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
			}, dom.byId("printButton"));
			printer.startup();
		}
		  
	function fShowLoading() {
	  esri.show(loading);
	  map.disableMapNavigation();
	  map.hideZoomSlider();
	}
	function fHideLoading(error) {
	  esri.hide(loading);
	  map.enableMapNavigation();
	  map.showZoomSlider();
	}

	function fLoadAllLayers() {
		var imageParameters = new ImageParameters();
        imageParameters.format = "PNG32"; //set the image type to PNG24, note default is PNG8.
		
		var infoTemplate = new InfoTemplate();
        infoTemplate.setTitle("Information");
        //infoTemplate.setContent("
		
		var infoTemplateDetail = new InfoTemplate();
          infoTemplateDetail.setTitle("Information");
		  infoTemplateDetail.setContent(
		"<table border=0 width=100%>" +
			"<tr>" + 
				"<td valign=top width=74><font face=Arial size=2>DISTRICT</font></td>" +
				" <td><font face=Arial size=2>: ${KABKOT}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td valign=top width=74><font face=Arial size=2>SUB DISTRICT</font></td>" +
				"<td><font face=Arial size=2>: ${KECAMATAN}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td valign=top width=74><font face=Arial size=2>VILLAGE</font></td>" +
				"<td><font face=Arial size=2>: ${DESA}</font></td>" +
			"</tr>" +
			"<tr>" +
				"<td colspan=2><font face=Arial size=2>${DESA:getFile}</font></td>" +
			"</tr>" +
			
		"</table>" 
		);
		getFile = function(value, key, data) {
			var result = ""
			
			switch(key) {
				case "DESA": 
					if (data.DESA == "RANTAU SULI") {
						result = "<a href=http://" + iAlamatLokal + "/mcai_dev/detail/Intervention.htm target=_blank " ;
						result = result + "onclick = window.open('','More Detail',";
						result = result + "'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500px,height=300px');return false";
						result = result + "><i>More Detail</i></a>";
					}					
					break;
			}
			console.log(result);
			return result

		}
		
		mcaiH = new FeatureLayer(iFeatureFolder + "1", {id:'1'});
		legendLayers.push({ layer: mcaiH, title: 'Community-based Health and Nutrition to Reduce Stunting Project'});
		mcaiPM = new FeatureLayer(iFeatureFolder + "2", {id:'2'});
		legendLayers.push({ layer: mcaiPM, title: 'Procurement Modernization Project'});
		mcaiGP = new FeatureLayer(iFeatureFolder + "3", {id:'3'});
		legendLayers.push({ layer: mcaiGP, title: 'Green Prosperity Project'});
		
		indonesiaLayer = new FeatureLayer(iFeatureFolder + "4", {id:"4"});
		indonesiaBackgroundLayer = new FeatureLayer(iFeatureFolder + "5", {id:'5'}); 
		
		/*
		landscapeFeatureLayer = new FeatureLayer(iMapServicesFolder + "indonesia/MapServer/207", {
			mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, 
			infoTemplate: infoTemplate,
			opacity: 0,
			outFields: ["*"]
		});
		*/
		
		//add for category analysis layers
		//----- administrative group -----
		lyr12 = new FeatureLayer(iFeatureFolder + "12", {
			id:"12",
			mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, 
			infoTemplate: infoTemplateDetail,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: lyr12, title: 'Village Boundary'});
		
		lyr11 = new FeatureLayer(iFeatureFolder + "11", {
			id:"11",
			mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, 
			infoTemplate: infoTemplate,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: lyr11, title: 'Sub District Boundary'});
		lyr10 = new FeatureLayer(iFeatureFolder + "10", {
			id:"10",
			mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, 
			infoTemplate: infoTemplate,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: lyr10, title: 'District Boundary'});		
		lyr9 = new FeatureLayer(iFeatureFolder + "9", {id:"9"});
		legendAdministrative.push({ layer: lyr9, title: 'Capital Sub District'});		
		lyr8 = new FeatureLayer(iFeatureFolder + "8", {id:"8", slider: true});
		legendAdministrative.push({ layer: lyr8, title: 'Capital District'});
		
		//----- agriculture group -----
		lyr14 = new FeatureLayer(iFeatureFolder + "14", {id:"14", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendAgriculture.push({ layer: lyr14, title: 'Plantation Concession'});
		
		//----- carbon project -----
		lyr20 = new FeatureLayer(iFeatureFolder + "20", {id:"20", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendCarbonProject.push({ layer: lyr20, title: 'Carbon Stock 2011 (MoF)'});
		lyr19 = new FeatureLayer(iFeatureFolder + "19", {id:"19", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendCarbonProject.push({ layer: lyr19, title: 'Berbak NP Carbon Initiative'});
		lyr18 = new FeatureLayer(iFeatureFolder + "18", {id:"18", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendCarbonProject.push({ layer: lyr18, title: 'Sampling Location (ICRAF)'});
		lyr17 = new FeatureLayer(iFeatureFolder + "17", {id:"17", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendCarbonProject.push({ layer: lyr17, title: 'Permanent Forest Plots (ZSL)'});
		lyr16 = new FeatureLayer(iFeatureFolder + "16", {id:"16", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendCarbonProject.push({ layer: lyr16, title: 'Carbon Measurement Points (ZSL)'});
		
		//----- climate -----
		lyr22 = new FeatureLayer(iFeatureFolder + "22", {id:"22", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendClimate.push({ layer: lyr22, title: 'Rain Falls'});
		
		//----- ecology -----
		lyr31 = new FeatureLayer(iFeatureFolder + "31", {id:"31", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr31, title: 'Important Ecosystem'});
		lyr30 = new FeatureLayer(iFeatureFolder + "30", {id:"30", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr30, title: 'Ecoregion (WWF)'});
		lyr29 = new FeatureLayer(iFeatureFolder + "29", {id:"29", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr29, title: 'HCV 3 – Endangered Ecosystem'});
		lyr28 = new FeatureLayer(iFeatureFolder + "28", {id:"28", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr28, title: 'HCV 2 – Important Natural Landscapes'});
		lyr27 = new FeatureLayer(iFeatureFolder + "27", {id:"27", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr27, title: 'HCV 1.2 - Threatened and Endangered Species (WWF)'});
		lyr26 = new FeatureLayer(iFeatureFolder + "26", {id:"26", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr26, title: 'HCV 1.1 - Wild Plant Sanctuaries (WWF)'});
		lyr25 = new FeatureLayer(iFeatureFolder + "25", {id:"25", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr25, title: 'Elephant Distribution'});
		lyr24 = new FeatureLayer(iFeatureFolder + "24", {id:"24", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr24, title: 'Tiger Distribution'});
				
		//----- energy -----
		lyr36 = new FeatureLayer(iFeatureFolder + "36", {id:"36", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr36, title: 'Transmission Line'});
		lyr35 = new FeatureLayer(iFeatureFolder + "35", {id:"35", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr35, title: 'Power Plants (Muaro Jambi)'});
		lyr34 = new FeatureLayer(iFeatureFolder + "34", {id:"34", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr34, title: 'Power Plants (Merangin)'});
		lyr33 = new FeatureLayer(iFeatureFolder + "33", {id:"33", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr33, title: 'RE Microhydro (Merangin)'});
		
		//----- forestry -----
		lyr45 = new FeatureLayer(iFeatureFolder + "45", {id:"45", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr45, title: 'Existing Forest Cover'});
		lyr44 = new FeatureLayer(iFeatureFolder + "44", {id:"44", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr44, title: 'Tenurial Forest'});
		lyr43 = new FeatureLayer(iFeatureFolder + "43", {id:"43", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr43, title: 'Village Forest'});
		lyr42 = new FeatureLayer(iFeatureFolder + "42", {id:"42", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr42, title: 'Rimba Corridor'});
		lyr41 = new FeatureLayer(iFeatureFolder + "41", {id:"41", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr41, title: 'Forest Management Unit'});
		lyr40 = new FeatureLayer(iFeatureFolder + "40", {id:"40", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr40, title: 'Forest Conservation Activities'});
		lyr39 = new FeatureLayer(iFeatureFolder + "39", {id:"39", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr39, title: 'Forest Production Moratorium'});
		lyr38 = new FeatureLayer(iFeatureFolder + "38", {id:"38", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr38, title: 'Forest Status'});
		
		/*
		//----- hazard vulnerability -----
		lyr52 = new FeatureLayer(iFeatureFolder + "52", {id:"52", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr52, title: 'Dryness BNPB'});
		lyr51 = new FeatureLayer(iFeatureFolder + "51", {id:"51", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr51, title: 'Earthquake BNPB'});
		lyr50 = new FeatureLayer(iFeatureFolder + "50", {id:"50", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr50, title: 'Flood BNPB'});
		lyr49 = new FeatureLayer(iFeatureFolder + "49", {id:"49", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr49, title: 'Forest File and Land BNPB'});
		*/
		
		//----- hotspot -----
		lyr55 = new FeatureLayer(iFeatureFolder + "55", {id:"55", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHotspot.push({ layer: lyr55, title: 'Hotspot Distribution (2012)'});
		lyr54 = new FeatureLayer(iFeatureFolder + "54", {id:"54", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHotspot.push({ layer: lyr54, title: 'Hotspot Distribution (2011)'});
		lyr53 = new FeatureLayer(iFeatureFolder + "53", {id:"53", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHotspot.push({ layer: lyr53, title: 'Hotspot Distribution (2010)'});
		lyr52 = new FeatureLayer(iFeatureFolder + "52", {id:"52", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHotspot.push({ layer: lyr52, title: 'Hotspot Distribution (1999 - 2009) '});
		
		//----- hydrology -----
		lyr69 = new FeatureLayer(iFeatureFolder + "69", {id:"69", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr69, title: 'Watershed Boundary'});
		lyr68 = new FeatureLayer(iFeatureFolder + "68", {id:"68", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr68, title: 'River - Tebo'});
		lyr67 = new FeatureLayer(iFeatureFolder + "67", {id:"67", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr67, title: 'River - Tanjung JabungTimur'});
		lyr66 = new FeatureLayer(iFeatureFolder + "66", {id:"66", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr66, title: 'River - Tanjung Jabung Barat'});
		lyr65 = new FeatureLayer(iFeatureFolder + "65", {id:"65", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr65, title: 'River - Sungai Penuh'});
		lyr64 = new FeatureLayer(iFeatureFolder + "64", {id:"64", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr64, title: 'River - Sarolangun'});
		lyr63 = new FeatureLayer(iFeatureFolder + "63", {id:"63", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr63, title: 'River - Muaro Jambi'});
		lyr62 = new FeatureLayer(iFeatureFolder + "62", {id:"62", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr62, title: 'River - Merangin'});
		lyr61 = new FeatureLayer(iFeatureFolder + "61", {id:"61", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr61, title: 'River - Kerinci'});
		lyr60 = new FeatureLayer(iFeatureFolder + "60", {id:"60", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr60, title: 'River - Kota Jambi'});
		lyr59 = new FeatureLayer(iFeatureFolder + "59", {id:"59", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr59, title: 'River - Bungo'});
		lyr58 = new FeatureLayer(iFeatureFolder + "58", {id:"58", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr58, title: 'River - Batanghari'});
		lyr57 = new FeatureLayer(iFeatureFolder + "57", {id:"57", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr57, title: 'Main River'});
		
		//----- Infrastructure -----
		lyr82 = new FeatureLayer(iFeatureFolder + "82", {id:"82", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr82, title: 'Other Road - Tebo'});
		lyr81 = new FeatureLayer(iFeatureFolder + "81", {id:"81", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr81, title: 'Other Road - Tanjung JabungTimur'});
		lyr80 = new FeatureLayer(iFeatureFolder + "80", {id:"80", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr80, title: 'Other Road - Tanjung Jabung Barat'});
		lyr79 = new FeatureLayer(iFeatureFolder + "79", {id:"79", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr79, title: 'Other Road - Sungai Penuh'});
		lyr78 = new FeatureLayer(iFeatureFolder + "78", {id:"78", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr78, title: 'Other Road - Sarolangun'});
		lyr77 = new FeatureLayer(iFeatureFolder + "77", {id:"77", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr77, title: 'Other Road - Muaro Jambi'});
		lyr76 = new FeatureLayer(iFeatureFolder + "76", {id:"76", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr76, title: 'Other Road - Merangin'});
		lyr75 = new FeatureLayer(iFeatureFolder + "75", {id:"75", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr75, title: 'Other Road - Kerinci'});
		lyr74 = new FeatureLayer(iFeatureFolder + "74", {id:"74", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr74, title: 'Other Road - Kota Jambi'});
		lyr73 = new FeatureLayer(iFeatureFolder + "73", {id:"73", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr73, title: 'Other Road - Bungo'});
		lyr72 = new FeatureLayer(iFeatureFolder + "72", {id:"72", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr72, title: 'Other Road - Batanghari'});
		lyr71 = new FeatureLayer(iFeatureFolder + "71", {id:"71", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr71, title: 'Main Road'});
		
		//----- Landcover -----
		lyr94 = new FeatureLayer(iFeatureFolder + "94", {id:"94", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr94, title: 'Landcover 2011 - Tebo'});
		lyr93 = new FeatureLayer(iFeatureFolder + "93", {id:"93", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr93, title: 'Landcover 2011 - Tanjung JabungTimur'});
		lyr92 = new FeatureLayer(iFeatureFolder + "92", {id:"92", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr92, title: 'Landcover 2011 - Tanjung Jabung Barat'});
		lyr91 = new FeatureLayer(iFeatureFolder + "91", {id:"91", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr91, title: 'Landcover 2011 - Sungai Penuh'});
		lyr90 = new FeatureLayer(iFeatureFolder + "90", {id:"90", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr90, title: 'Landcover 2011 - Sarolangun'});
		lyr89 = new FeatureLayer(iFeatureFolder + "89", {id:"89", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr89, title: 'Landcover 2011 - Muaro Jambi'});
		lyr88 = new FeatureLayer(iFeatureFolder + "88", {id:"88", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr88, title: 'Landcover 2011 - Merangin'});
		lyr87 = new FeatureLayer(iFeatureFolder + "87", {id:"87", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr87, title: 'Landcover 2011 - Kerinci'});
		lyr86 = new FeatureLayer(iFeatureFolder + "86", {id:"86", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr86, title: 'Landcover 2011 - Kota Jambi'});
		lyr85 = new FeatureLayer(iFeatureFolder + "85", {id:"85", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr85, title: 'Landcover 2011 - Bungo'});
		lyr84 = new FeatureLayer(iFeatureFolder + "84", {id:"84", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr84, title: 'Landcover 2011 - Batanghari'});
		
		//----- landscape -----
		lyr97 = new FeatureLayer(iFeatureFolder + "97", {id:"97", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandscape.push({ layer: lyr97, title: 'Sungai Tenang'});
		lyr96 = new FeatureLayer(iFeatureFolder + "96", {id:"96", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandscape.push({ layer: lyr96, title: 'Berbak'});
		
		//----- land degradation -----
		lyr99 = new FeatureLayer(iFeatureFolder + "99", {id:"99", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandDegradation.push({ layer: lyr99, title: 'Critical Land'});
		
		//----- landuse spatial plan -----
		lyr101 = new FeatureLayer(iFeatureFolder + "101", {id:"101", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLanduseSpatialPlan.push({ layer: lyr101, title: 'Draft RTRWP Jambi (2011)'});
		
		//----- mining -----
		lyr104 = new FeatureLayer(iFeatureFolder + "104", {id:"104", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendMining.push({ layer: lyr104, title: 'Oil and Gas Concession'});
		lyr103 = new FeatureLayer(iFeatureFolder + "103", {id:"103", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendMining.push({ layer: lyr103, title: 'Mining Concession'});
		
		//----- permits -----
		lyr113 = new FeatureLayer(iFeatureFolder + "113", {id:"113", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr113, title: 'Permit to Utilize Forest Product in Ecological Restoration'});
		lyr112 = new FeatureLayer(iFeatureFolder + "112", {id:"112", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr112, title: 'Permit to Utilize Forest Product in Community Timber Estate'});
		lyr111 = new FeatureLayer(iFeatureFolder + "111", {id:"111", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr111, title: 'Permit to Utilize Forest Product in Timber Estate'});
		lyr110 = new FeatureLayer(iFeatureFolder + "110", {id:"110", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr110, title: 'Permit to Utilize Forest Product in Natural Forest'});
		lyr109 = new FeatureLayer(iFeatureFolder + "109", {id:"109", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr109, title: 'Land Cultivation Right (HGU)'});
		lyr108 = new FeatureLayer(iFeatureFolder + "108", {id:"108", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr108, title: 'Forest Land Swap (IPPKH)'});
		lyr107 = new FeatureLayer(iFeatureFolder + "107", {id:"107", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr107, title: 'Forest Conversion to Plantation Development'});
		lyr106 = new FeatureLayer(iFeatureFolder + "106", {id:"106", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr106, title: 'Forest Conversion to Transmigration Development'});
		
		//----- socio economic -----
		lyr116 = new FeatureLayer(iFeatureFolder + "116", {id:"116", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSocioEconomic.push({ layer: lyr116, title: 'Population Distribution'});
		lyr115 = new FeatureLayer(iFeatureFolder + "115", {id:"115", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSocioEconomic.push({ layer: lyr115, title: 'Indigenous People'});
		
		//----- soil -----
		lyr120 = new FeatureLayer(iFeatureFolder + "120", {id:"120", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr120, title: 'Peat Soil'});
		lyr119 = new FeatureLayer(iFeatureFolder + "119", {id:"119", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr119, title: 'Soil'});
		lyr118 = new FeatureLayer(iFeatureFolder + "118", {id:"118", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr118, title: 'Fault'});
		
		//----- topography -----
		lyr132 = new FeatureLayer(iFeatureFolder + "132", {id:"132", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr132, title: 'Contour Line - Tebo'});
		lyr131 = new FeatureLayer(iFeatureFolder + "131", {id:"131", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr131, title: 'Contour Line - Tanjung JabungTimur'});
		lyr130 = new FeatureLayer(iFeatureFolder + "130", {id:"130", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr130, title: 'Contour Line - Tanjung Jabung Barat'});
		lyr129 = new FeatureLayer(iFeatureFolder + "129", {id:"129", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr129, title: 'Contour Line - Sungai Penuh'});
		lyr128 = new FeatureLayer(iFeatureFolder + "128", {id:"128", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr128, title: 'Contour Line - Sarolangun'});
		lyr127 = new FeatureLayer(iFeatureFolder + "127", {id:"127", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr127, title: 'Contour Line - Muaro Jambi'});
		lyr126 = new FeatureLayer(iFeatureFolder + "126", {id:"126", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr126, title: 'Contour Line - Merangin'});
		lyr125 = new FeatureLayer(iFeatureFolder + "125", {id:"125", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr125, title: 'Contour Line - Kerinci'});
		lyr124 = new FeatureLayer(iFeatureFolder + "124", {id:"124", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr124, title: 'Contour Line - Kota Jambi'});
		lyr123 = new FeatureLayer(iFeatureFolder + "123", {id:"123", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr123, title: 'Contour Line - Bungo'});
		lyr122 = new FeatureLayer(iFeatureFolder + "122", {id:"122", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr122, title: 'Contour Line - Batanghari'});
		
		map.addLayers([
			//indonesiaBackgroundLayer, 
			indonesiaLayer,
			mcaiGP, mcaiH, mcaiPM,
			
			//administrative group layers
			 lyr8, lyr9, lyr10, lyr11, lyr12,
			
			//agriculture group layers
			lyr14,
			
			//carbon project group layers
			lyr16, lyr17, lyr18, lyr19, lyr20, 
			
			//climate group layers
			lyr22,
			
			//ecology group layers
			lyr24, lyr25, lyr26, lyr27, lyr28, lyr29, lyr30, lyr31, 
			
			//energy group layers
			lyr33, lyr34, lyr35, lyr36, 
			
			//forestry group layers
			lyr38, lyr39, lyr40, lyr41, lyr42, lyr43, lyr44, lyr45,
			
			/*
			//hazard vulnerability group layers
			lyr49, lyr50, lyr51, lyr52, 
			*/
			
			//hotspot group layers
			lyr52, lyr53, lyr54, lyr55,
			
			//hydrology group layers
			lyr57, lyr58, lyr59, lyr60, lyr61, lyr62, lyr63, lyr64, lyr65, lyr66, lyr67, lyr68, lyr69, 
			
			//infrastructure group layers
			lyr71, lyr72, lyr73, lyr74, lyr75, lyr76, lyr77, lyr78, lyr79, lyr80, lyr81, lyr82, 
			
			//landcover
			lyr84, lyr85, lyr86, lyr87, lyr88, lyr89, lyr90, lyr91, lyr92, lyr93, lyr94, 
			
			//lanscape group layers
			lyr96, lyr97, 
			
			//land degradation group layers
			lyr99,  
			
			//landuse spatial plan group layers
			lyr101,
			
			//mining group layers
			lyr103, lyr104, 
			
			//permits group layers
			lyr106, lyr107, lyr108, lyr109, lyr110, lyr111, lyr112, lyr113, 
			
			//socio economic group layers
			lyr115, lyr116, 
			
			//soil group layers
			lyr118, lyr119, lyr120,  
			
			//topography group layers
			lyr122, lyr123, lyr124, lyr125, lyr126, lyr127, lyr128, lyr129, lyr130, lyr131, lyr132
		]);
		
		console.log("load service layer success");
	}
	
	function calcOffset() {
		//return (map.extent.getWidth() / map.width);
	}

	function fAddLabelLayers() {
		try {
			var labelField = "City_name";

			// create a renderer for the capital layer to override default symbology
			var capitalColor = new esri.Color("#666");
			var capitalLine = new SimpleLineSymbol("solid", capitalColor, 1.5);
			var capitalSymbol = new SimpleFillSymbol("solid", capitalLine, null);
			var capitalRenderer = new SimpleRenderer(capitalSymbol);
			// create a feature layer to show country boundaries
			var capitalUrl = iFeatureFolder + "8";
			capitalLayer = new FeatureLayer(capitalUrl, {
			  id: "capital",
			  outFields: [labelField] 
			});
			capitalLayer.setRenderer(capitalRenderer);
			map.addLayer(capitalLayer);
			 // create a text symbol to define the style of labels
			var capitalLabel = new TextSymbol().setColor(capitalColor);
			capitalLabel.font.setSize("10pt");
			capitalLabel.font.setFamily("arial");
			capitalLabelRenderer = new SimpleRenderer(capitalLabel);
			labelLayer = new LabelLayer({ id: "labels" });
			// tell the label layer to label the countries feature layer 
			// using the field named "admin"
			labelLayer.addFeatureLayer(capitalLayer, capitalLabelRenderer, "${" + labelField + "}");
			// add the label layer to the map
			map.addLayer(labelLayer);
		}
		catch (err) {
			alert ("Error found");
			console.log (err.message);
		}
	}
	
	function fSetLegend() {
		map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: legendLayers
          }, "legendDiv");
          legenda.startup();
        });
		
		//administrative legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: legendAdministrative
          }, "legendAdministrativeDiv");
          legenda.startup();
        });
		
		//agriculture legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: legendAgriculture
          }, "legendAgricultureDiv");
          legenda.startup();
        });
		
		//carbon project legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: legendCarbonProject
          }, "legendCarbonProjectDiv");
          legenda.startup();
        });
		
		//climate legend 
		//fCreateLegendDiv(legendClimate,"legendClimateDiv");
			map.on('layers-add-result', function () {
			var legenda = new Legend({
				map: map,
				layerInfos: legendClimate
			  }, "legendClimateDiv");
			  legenda.startup();
			});
			
		//ecology legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendEcology
		  }, "legendEcologyDiv");
		  legenda.startup();
		});
		
		//energy legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendEnergy
		  }, "legendEnergyDiv");
		  legenda.startup();
		});
		
		//forestry legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendForestry
		  }, "legendForestryDiv");
		  legenda.startup();
		});
		/*
		//hazard vulnerability legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendHazardVunerabillity
		  }, "legendHazardVunerabillityDiv");
		  legenda.startup();
		});
		*/
		//hotspot legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendHotspot
		  }, "legendHotspotDiv");
		  legenda.startup();
		});
		
		//hydrology legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendHydrology
		  }, "legendHydrologyDiv");
		  legenda.startup();
		});
		
		//infrastructure legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendInfrastructure
		  }, "legendInfrastructureDiv");
		  legenda.startup();
		});
		
		//landcover legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendLandcover
		  }, "legendLandcoverDiv");
		  legenda.startup();
		});
		
		//landscape legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendLandscape
		  }, "legendLandscapeDiv");
		  legenda.startup();
		});
		
		//land degradation legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendLandDegradation
		  }, "legendLandDegradationDiv");
		  legenda.startup();
		});
		
		//landuse spatial plan legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendLanduseSpatialPlan
		  }, "legendLanduseSpatialPlanDiv");
		  legenda.startup();
		});
		
		//mining legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendMining
		  }, "legendMiningDiv");
		  legenda.startup();
		});
		
		//permits legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendPermits
		  }, "legendPermitsDiv");
		  legenda.startup();
		});
		
		//socio economic legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendSocioEconomic
		  }, "legendSocioEconomicDiv");
		  legenda.startup();
		});
		
		//soil legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendSoil
		  }, "legendSoilDiv");
		  legenda.startup();
		});
		
		//topography legend 
		map.on('layers-add-result', function () {
		var legenda = new Legend({
			map: map,
			layerInfos: legendTopography
		  }, "legendTopographyDiv");
		  legenda.startup();
		});		
	}	
	
	function changeTransparency(value) {
		var layer = map.getLayer(8);
		if(layer != null)
		{
			layer.setOpacity(value);
		}
	}
	
	function fAddCategoryGroup() {		
		//----- genereal -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLayers, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });
			
            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleGeneral"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- administrative -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendAdministrative, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });
			
            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleAdministrative"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- agriculture -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendAgriculture, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleAgriculture"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- carbon project -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendCarbonProject, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleCarbonProject"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- climate -----
		//fCreateCheckboxToggle(legendClimate, "toggleClimate");
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendClimate, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleClimate"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- ecology -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendEcology, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleEcology"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- energy -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendEnergy, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleEnergy"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- forestry -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendForestry, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleForestry"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		/*
		//----- hazard vulnerability -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendHazardVunerabillity, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });
			
            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleHazardVunerabillity"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		*/
		
		//----- hotspot -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendHotspot, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleHotspot"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- hydrology -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendHydrology, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleHydrology"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- infrastructure -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendInfrastructure, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleInfrastructure"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- landcover -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLandcover, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleLandcover"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- landscape -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLandscape, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleLandscape"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- land degradation -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLandDegradation, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleLandDegradation"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- landuse spatial plan -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendLanduseSpatialPlan, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleLanduseSpatialPlan"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- mining -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendMining, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleMining"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- permits -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendPermits, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("togglePermits"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//-----socio economic -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendSocioEconomic, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleSocioEconomic"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- soil -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendSoil, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleSoil"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });
		
		//----- topography -----
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(legendTopography, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggleTopography"), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });		
	}
	
	function fCreateLegendDiv(iLegendInfo, iLegendDiv) {
		/*
		try {
			map.on('layers-add-result', function () {
			var legenda = new Legend({
				map: map,
				layerInfos: iLegendInfo
			  }, iLegendDiv);
			  legenda.startup();
			});
		}
		catch e(){
			alert("An error has occured " + e.message);
			console.log("Error at fCreateLegendDiv. " + e.message);
		}*/
	}
	function fCreateCheckboxToggle(iLegendName, iToggleName){
		map.on('layers-add-result', function () {
          //add check boxes
          arrayUtils.forEach(iLegendName, function (layer) {
            var layerName = layer.title;
            var checkBox = new CheckBox({
              name: "checkBox" + layer.layer.id,
              value: layer.layer.id,
              checked: layer.layer.visible
            });
            checkBox.on("change", function () {
              var targetLayer = map.getLayer(this.value);
              targetLayer.setVisibility(!targetLayer.visible);
              this.checked = targetLayer.visible;
			  fAdditionalInfo(this.value);
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId(iToggleName), "after");
            var checkLabel = domConstruct.create('label', {
                'for': checkBox.name,
                innerHTML: layerName
              }, checkBox.domNode, "after");
            domConstruct.place("<br />", checkLabel, "after");
          });
        });		
	}
	
	function fCheckLegendDiv() {
		var iAktif=false;
		
		//general
		 arrayUtils.forEach(legendLayers, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {
			dom.byId("legendDiv").innerHTML="";			
			};
		 iAktif=false;
		 
		//legendAdministrativeDiv
		 arrayUtils.forEach(legendAdministrative, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendAdministrativeDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendAgricultureDiv
		 arrayUtils.forEach(legendAgriculture, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendAgricultureDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendCarbonProjectDiv
		 arrayUtils.forEach(legendCarbonProject, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendCarbonProjectDiv").innerHTML="";};
		 iAktif=false;
		 
		//general
		 arrayUtils.forEach(legendLayers, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendClimateDiv
		 arrayUtils.forEach(legendClimate, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendClimateDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendEcologyDiv
		 arrayUtils.forEach(legendEcology, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendEcologyDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendEnergyDiv
		 arrayUtils.forEach(legendEnergy, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendEnergyDiv").innerHTML="";};
		 iAktif=false;
		 
		 //legendForestryDiv
		 arrayUtils.forEach(legendForestry, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendForestryDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendHazardVunerabillityDiv
		 arrayUtils.forEach(legendHazardVunerabillity, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendHazardVunerabillityDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendHotspotDiv
		 arrayUtils.forEach(legendHotspot, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendHotspotDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendHydrologyDiv
		 arrayUtils.forEach(legendHydrology, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendHydrologyDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendInfrastructureDiv
		 arrayUtils.forEach(legendInfrastructure, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendInfrastructureDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendLandcoverDiv
		 arrayUtils.forEach(legendLandcover, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendLandcoverDiv").innerHTML="";};
		 iAktif=false;
		
		//legendLandscapeDiv
		 arrayUtils.forEach(legendLandscape, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendLandscapeDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendLandDegradationDiv
		 arrayUtils.forEach(legendLandDegradation, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}
         });
		 if (!iAktif) {dom.byId("legendLandDegradationDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendMiningDiv
		 arrayUtils.forEach(legendMining, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendMiningDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendTopographyDiv
		 arrayUtils.forEach(legendTopography, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendTopographyDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendPermitsDiv
		 arrayUtils.forEach(legendPermits, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendPermitsDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendLanduseSpatialPlanDiv
		 arrayUtils.forEach(legendLanduseSpatialPlan, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendLanduseSpatialPlanDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendSocioEconomicDiv
		 arrayUtils.forEach(legendSocioEconomic, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendSocioEconomicDiv").innerHTML="";};
		 iAktif=false;
		 
		//legendSoilDiv
		 arrayUtils.forEach(legendSoil, function (layer) {
			if (map.getLayer(layer.layer.id).visible) {iAktif=true}			
         });
		 if (!iAktif) {dom.byId("legendSoilDiv").innerHTML="";};
		 iAktif=false;
	}
	
	function fAdditionalInfo(iVal) {
		fCheckLegendDiv();
		
		//alert(iVal);
		var targetLayer = map.getLayer(iVal);        
		var iIsi1 = "<table><tr><td valign='top'>Layer Name</td><td valign='top'>";
		var iIsi2 ="</td></tr><tr><td valign='top'>Description</td><td valign='top'>";
		var iIsi3 ="</td></tr><tr><td valign='top'>Source</td><td valign='top'>";
		var iIsi4 ="</td></tr></table><br>";
		var iKet1 = "", iKet2 = "", iKet3 = "";
		var iHasilPlantation="", iHasilBerbak="", iHasilCarbon="", iHasil ="";
		
		try {
			capitalLayer.hide();
			labelLayer.hide();
				
			for (var i = 1; i < 132; i++) {
				//capital district label 
				//district layer
				if (i == "8" && map.getLayer(i).visible) {					
					capitalLayer.show();
					labelLayer.show();			
					//alert("Edo");
				}
				
				//district layer
				if (i == "10" && map.getLayer(i).visible) {			
					iKet1 = "District Boundary";				
					iKet2 = "Polygon showing district boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//subdistrict layer
				if (i == "11" && map.getLayer(i).visible) {			
					iKet1 = "Sub District Boundary";				
					iKet2 = "Polygon showing sub district boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//village layer
				if (i == "12" && map.getLayer(i).visible) {			
					iKet1 = "Village Boundary";				
					iKet2 = "Polygon showing village boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//plantation concession layer
				if (i == "14" && map.getLayer(i).visible) {			
					iKet1 = "Plantation Concession";
					
					iKet2 = "Palm oil plantations polygon in Jambi province, scale 1:250.000. The data contains commodities such as cocoa, rubber, and ";
					iKet2 = iKet2 + "oil palm. Update 2012. Data was verified with tabular data released by the Department of Plantation in Jambi Province. ";
					iKet2 = iKet2 + "PTHI added types of permits, no SK, Description, and SK Date.";
					
					iKet3 = "Disbun & PT. Hatfield Indonesia (PTHI)";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}

				//berbak np carbon initiative layer
				if (i == "19" && map.getLayer(i).visible) {
					iKet1 = "Berbak NP Carbon Initiative";
					
					iKet2 = "Polygon showing location of carbon project, which is based on MoU between Zoological Society of London (ZSL) Indonesia and  Berbak National Park signed on October 12th 2011.  ";
					iKet2 = iKet2 + "The MoU aims to reduce emission from deforestation and degradation in ";
					iKet2 = iKet2 + "Berbak National Park, which includes 3 year work plan to achieve self-financing, sustainable conservation of the area.";

					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}

				//carbon measurement layer
				if (i == "16" && map.getLayer(i).visible) {
					iKet1 = "Carbon Measurement Points (ZSL)";
					
					iKet2 = "Points showing location of carbon measurement in Berbak National Park";
					
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//carbon stock layer
				if (i == "20" && map.getLayer(i).visible) {
					iKet1 = "Carbon Stock 2011 (MoF)";
					
					iKet2 = "Carbon stock estimation, which was derived by landcover and carbon value. ";
					iKet2 = iKet2 + "Carbon value calculated based on reference from IPCC. Scale 1:250.000";
					
					iKet3 = "MoF & PTHI";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//permanent forest layer
				if (i == "17" && map.getLayer(i).visible) {
					iKet1 = "Permanent Forest Plots (ZSL)";
					iKet2 = "Points showing location of permanent forest plots in Berbak National Park";
					iKet3 = "MoF & PTHI";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//sampling location layer
				if (i == "18" && map.getLayer(i).visible) {
					iKet1 = "Sampling Location (ICRAF)";
					iKet2 = "Carbon measurement sampling for ALREDDI-ICRAF year 2012. ";
					iKet2 = iKet2 + "The map derived from coordinate of sampling location.";
					iKet3 = "ICRAF report & PTHI.";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//rain falls layer
				if (i == "22" && map.getLayer(i).visible) {
					iKet1 = "Rain Falls";
					iKet2 = "Precipitation data in Jambi Province, scale 1:250.000. Based  on landsystem 1987. ";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}

				//tiger distribution layer
				if (i == "24" && map.getLayer(i).visible) {
					iKet1 = "Tiger Distribution";
					iKet2 = "Polygon showing tiger habitat in Sumatra, based on area  of 250km2 assumption which is the smallest area for tiger to be able to live.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//elephant distribution layer
				if (i == "25" && map.getLayer(i).visible) {
					iKet1 = "Elephant Distribution";
					iKet2 = "Polygon showing elephant distribution in Sumatera. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 1 1 layer
				if (i == "26" && map.getLayer(i).visible) {
					iKet1 = "HCV 1.1 - Wild Plant Sanctuaries (WWF)";
					iKet2 = "Polygon showing wild plant sanctuary area to support biodiversity.  The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 1 2 layer
				if (i == "27" && map.getLayer(i).visible) {
					iKet1 = "HCV 1.2 - Threatened and Endangered Species (WWF)";
					iKet2 = "Polygon showing threatens and endangered species ecosystem. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 2 layer
				if (i == "28" && map.getLayer(i).visible) {
					iKet1 = "HCV 2 – Important Natural Landscapes";
					iKet2 = "Polygon showing natural landscapes, which has capacity to maintain natural ecology processes and dynamics. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 3 layer
				if (i == "29" && map.getLayer(i).visible) {
					iKet1 = "HCV 3 – Endangered Ecosystem ";
					iKet2 = "Polygon showing rare and endangered ecosystem. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//ecoregions layer
				if (i == "30" && map.getLayer(i).visible) {
					iKet1 = "Ecoregion (WWF)";
					iKet2 = "Polygon showing econame and regions in Sumatera 1999 - 2000. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//importan ecosystem layer
				if (i == "31" && map.getLayer(i).visible) {
					iKet1 = "Important Ecosystem";
					iKet2 = "Polygon showing Important ecosystem. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//transmission line layer
				if (i == "36" && map.getLayer(i).visible) {
					iKet1 = "Transmission Line";
					iKet2 = "Line showing existing transmission line in Jambi.";
					iKet3 = "Bappeda";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest land status layer
				if (i == "38" && map.getLayer(i).visible) {
					iKet1 = "Forest Status";
					iKet2 = "Polygon showing forest function (Protected Forest, Production Forest, Limited Production Forest, etc)";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//ppib layer
				if (i == "39" && map.getLayer(i).visible) {
					iKet1 = "Forest Production Moratorium";
					iKet2 = "Polygon showing forest production moratorium in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest conservation alliance layer
				if (i == "40" && map.getLayer(i).visible) {
					iKet1 = "Forest Concession Activities";
					iKet2 = "Polygon showing forest conservation activities in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest management unit layer
				if (i == "41" && map.getLayer(i).visible) {
					iKet1 = "Forest Management Unit";
					iKet2 = "Polygon showing forest management unit.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//rimba corridor layer
				if (i == "42" && map.getLayer(i).visible) {
					iKet1 = "Rimba Corridor";
					iKet2 = "Polygon showing Rimba Corridor in Sumatera";
					iKet3 = "MCC dataset";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//village forest layer
				if (i == "43" && map.getLayer(i).visible) {
					iKet1 = "Village Forest";
					iKet2 = "Polygon showing village forest management.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//tenurial forest alliance layer
				if (i == "44" && map.getLayer(i).visible) {
					iKet1 = "Tenurial Forest";
					iKet2 = "Polygon showing tenurial forest.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest fire and land layer
				/*
				if (i == "49" && map.getLayer(i).visible) {
					iKet1 = "Forest Fire and Land";
					iKet2 = "Raster showing fire vulnerability in forest and non-forest.";
					iKet3 = "BNPB";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//flood layer
				if (i == "50" && map.getLayer(i).visible) {
					iKet1 = "Flood";
					iKet2 = "Raster showing flood vulnerability.";
					iKet3 = "BNPB";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//earhtquake layer
				if (i == "51" && map.getLayer(i).visible) {
					iKet1 = "Earthquake";
					iKet2 = "Raster showing earthquake vulnerability.";
					iKet3 = "BNPB";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//dryness layer
				if (i == "52" && map.getLayer(i).visible) {
					iKet1 = "Dryness";
					iKet2 = "Raster showing dryness vulnerability.";
					iKet3 = "BNPB";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				
				//hotspot layer
				if (i == "52" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (1999 - 2009)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 1999 - 2009.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "53" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (2010)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 2010.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "54" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (2011)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 2011.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "55" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution (2012)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 1999 - 2012.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//watershed boundary layer
				if (i == "69" && map.getLayer(i).visible) {
					iKet1 = "Watershed Boundary";
					iKet2 = "Polygon showing watershed boundary based on SK 511/Menhut-V/2011.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//river big layer
				if (i == "57" && map.getLayer(i).visible) {
					iKet1 = "Main River";
					iKet2 = "Polygon showing main river.";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//river small layer
				if (
					(i == "58" && map.getLayer(i).visible) || 
					(i == "59" && map.getLayer(i).visible) || 
					(i == "60" && map.getLayer(i).visible) || 
					(i == "61" && map.getLayer(i).visible) || 
					(i == "62" && map.getLayer(i).visible) || 
					(i == "63" && map.getLayer(i).visible) || 
					(i == "64" && map.getLayer(i).visible) || 
					(i == "65" && map.getLayer(i).visible) || 
					(i == "66" && map.getLayer(i).visible) || 
					(i == "67" && map.getLayer(i).visible) || 
					(i == "68" && map.getLayer(i).visible)
					) {
					iKet1 = "River";
					iKet2 = "Polygon showing smaller river.";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
							
				//landcover layer
				if (
					(i == "84" && map.getLayer(i).visible) || 
					(i == "85" && map.getLayer(i).visible) || 
					(i == "86" && map.getLayer(i).visible) || 
					(i == "87" && map.getLayer(i).visible) || 
					(i == "88" && map.getLayer(i).visible) || 
					(i == "89" && map.getLayer(i).visible) || 
					(i == "90" && map.getLayer(i).visible) || 
					(i == "91" && map.getLayer(i).visible) || 
					(i == "92" && map.getLayer(i).visible) || 
					(i == "93" && map.getLayer(i).visible) || 
					(i == "94" && map.getLayer(i).visible)
					) {
					iKet1 = "Landcover 2011 (MoF)";
					iKet2 = "Polygon showing landcover in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//critical land layer
				if (i == "99" && map.getLayer(i).visible) {
					iKet1 = "Critical Land";
					iKet2 = "Polygon showing critical land, which is classified as very critical, somewhat critical, critical, critical potential, and not critical.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//gerhan layer
				/*
				if (i == "71" && map.getLayer(i).visible) {
					iKet1 = "Gerhan";
					iKet2 = "Polygon showing the progress of forest rehabilitation activity for the period 2003 – 2007.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				
				//landuse spatial plan layer
				if (i == "101" && map.getLayer(i).visible) {
					iKet1 = "Landuse Spatial Plan";
					iKet2 = "Polygon showing the draft of RTRW of Jambi.";
					iKet3 = "Bappeda";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//mining concession layer
				if (i == "103" && map.getLayer(i).visible) {
					iKet1 = "Mining Concession";
					iKet2 = "Polygon showing mining concession, including the name of the company and status of concession.";
					iKet3 = "Bappeda & ESDM";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//oil and gas concession layer
				if (i == "104" && map.getLayer(i).visible) {
					iKet1 = "Oil and Gas Concession";
					iKet2 = "Polygon showing oil and gas concession, including, block name, company name, and status of concession.";
					iKet3 = "Petromindo, ESDM, PTHI";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest area release layer
				if (i == "106" && map.getLayer(i).visible) {
					iKet1 = "Forest Conversion to Transmigration Development";
					iKet2 = "Polygon showing forest conversion to transmigrasi, including license number(no SK), date and area.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest area release plantation layer
				if (i == "107" && map.getLayer(i).visible) {
					iKet1 = "Forest Conversion to Plantation Development";
					iKet2 = "Polygon showing forest conversion to oil palm plantation, including company name, license number(no SK), date and area.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest land swap layer
				if (i == "108" && map.getLayer(i).visible) {
					iKet1 = "Forest Land Swap (IPPKH)";
					iKet2 = "Polygon showing forest temporary use (pinjam pakai) for mining including the name of company and license number.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hgu layer
				if (i == "109" && map.getLayer(i).visible) {
					iKet1 = "Land Cultivation Right (HGU)";
					iKet2 = "Polygon showing plantations permits.";
					iKet3 = "BPN";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk ha layer
				if (i == "110" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Natural Forest";
					iKet2 = "Polygon showing timber concessions in Jambi province. Issued on 2013.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk hti layer
				if (i == "111" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Timber Estate";
					iKet2 = "Polygon showing industrial timber plantation concessions in Jambi province. Issued on 2013.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk htr layer
				if (i == "112" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Community Timber Estate";
					iKet2 = "Polygon showing forest plantation managed by local people.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk re layer
				if (i == "113" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Ecological Restoration";
					iKet2 = "Polygon showing location of ecosystem restoration in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//indigenous people layer
				if (i == "115" && map.getLayer(i).visible) {
					iKet1 = "Indigenous People";
					iKet2 = "Point showing location of indigenous people.";
					iKet3 = "unknown";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//distribution of the population layer
				if (i == "116" && map.getLayer(i).visible) {
					iKet1 = "Population Distribution";
					iKet2 = "Polygon showing administrative boundary with attribute contains number and density of population.";
					iKet3 = "Bappeda";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//fault layer
				if (i == "118" && map.getLayer(i).visible) {
					iKet1 = "Fault";
					iKet2 = "Line showing fault line in Jambi.";
					iKet3 = "Bappeda";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//soil layer
				if (i == "119" && map.getLayer(i).visible) {
					iKet1 = "Soil";
					iKet2 = "Polygon showing soil types based on USDA soil classification.";
					iKet3 = "MoA";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//peat soil layer
				if (i == "120" && map.getLayer(i).visible) {
					iKet1 = "Peat Soil";
					iKet2 = "Polygon showing peat soil including type and depth of the peat soil.";
					iKet3 = "MoA";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//topographic layer
				if (
					(i == "122" && map.getLayer(i).visible) || 
					(i == "123" && map.getLayer(i).visible) || 
					(i == "124" && map.getLayer(i).visible) || 
					(i == "125" && map.getLayer(i).visible) || 
					(i == "126" && map.getLayer(i).visible) || 
					(i == "127" && map.getLayer(i).visible) || 
					(i == "128" && map.getLayer(i).visible) || 
					(i == "129" && map.getLayer(i).visible) || 
					(i == "130" && map.getLayer(i).visible) || 
					(i == "131" && map.getLayer(i).visible) || 
					(i == "132" && map.getLayer(i).visible)
					) {
					iKet1 = "Contour Line";
					iKet2 = "Line showing contour/elevation line based on RBI map scale 1:50.000.";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				
				
				
				
			}
		}
		catch (err) {
			alert ("Error found at fAdditionalInfo function");
			console.log(err.message);
		}
		
		//iHasil = iHasilPlantation + iHasilBerbak + iHasilCarbon + iHasilCarbonMeasurement ;
		//add layer sort description
		dom.byId("shortDescriptionDiv").innerHTML=iHasil;
	}
	
	function fHomeButton() {
		hideLayers();
		//mcaiLayer.show();
		
		//fRadioProvince();
		fRadioProvinceZT();
		
		//dijit.byId("provinceSelect").attr("disabled", false);
		//dijit.byId("radioProvince").attr("checked", true);
		
		dijit.byId("provinceSelectZT").attr("disabled", false);
		dijit.byId("radioProvinceZT").attr("checked", true);
		
		dojo.forEach (dojo.query("input[type=checkbox]"), function(item){
			var widget = dijit.getEnclosingWidget(item);
			//alert(widget)
			widget.set('checked', false);
		})
		
		fAdditionalInfo(1);
	}
		
	function hideLayers() {
		fHideAllFeatureLayers();
	}
	function fKosongDiv() {
		dom.byId("legendDiv").innerHTML="";
		dom.byId("legendAdministrativeDiv").innerHTML="";
		dom.byId("legendAgricultureDiv").innerHTML="";
		dom.byId("legendCarbonProjectDiv").innerHTML="";
		dom.byId("legendClimateDiv").innerHTML="";
		dom.byId("legendEcologyDiv").innerHTML="";
		dom.byId("legendEnergyDiv").innerHTML="";
		dom.byId("legendForestryDiv").innerHTML="";
		dom.byId("legendHazardVunerabillityDiv").innerHTML="";
		dom.byId("legendHotspotDiv").innerHTML="";
		dom.byId("legendHydrologyDiv").innerHTML="";
		dom.byId("legendInfrastructureDiv").innerHTML="";
		dom.byId("legendLandcoverDiv").innerHTML="";
		dom.byId("legendLandscapeDiv").innerHTML="";
		dom.byId("legendLandDegradationDiv").innerHTML="";
		dom.byId("legendMiningDiv").innerHTML="";
		dom.byId("legendPermitsDiv").innerHTML="";
		dom.byId("legendLanduseSpatialPlanDiv").innerHTML="";
		dom.byId("legendSocioEconomicDiv").innerHTML="";
		dom.byId("legendSoilDiv").innerHTML="";
		dom.byId("legendTopographyDiv").innerHTML="";
	}
	function fHideAllFeatureLayers() {
			//indonesiaBackgroundLayer.hide(); 
			//indonesiaLayer.hide(); 
			mcaiGP.hide(); mcaiH.hide();  mcaiPM.hide(); 
			
			//administrative group layers
			 lyr8.hide();  lyr9.hide();  lyr10.hide();  lyr11.hide();  lyr12.hide(); 
			
			//agriculture group layers
			lyr14.hide(); 
			
			//carbon project group layers
			lyr16.hide();  lyr17.hide();  lyr18.hide();  lyr19.hide();  lyr20.hide();  
			
			//climate group layers
			lyr22.hide(); 
			
			//ecology group layers
			lyr24.hide();  lyr25.hide();  lyr26.hide();  lyr27.hide();  lyr28.hide();  lyr29.hide();  lyr30.hide();  lyr31.hide();  
			
			//energy group layers
			lyr33.hide();  lyr34.hide();  lyr35.hide();  lyr36.hide();  
			
			//forestry group layers
			lyr38.hide();  lyr39.hide();  lyr40.hide();  lyr41.hide();  lyr42.hide();  lyr43.hide();  lyr44.hide();  lyr45.hide(); 
			
			/*
			//hazard vulnerability group layers
			lyr49.hide();  lyr50.hide();  lyr51.hide();  lyr52.hide();  
			*/
			
			//hotspot group layers
			lyr52.hide();  lyr53.hide();  lyr54.hide();  lyr55.hide(); 
			
			//hydrology group layers
			lyr57.hide();  lyr58.hide();  lyr59.hide();  lyr60.hide();  lyr61.hide();  lyr62.hide();  lyr63.hide();  lyr64.hide();  lyr65.hide();  lyr66.hide();  lyr67.hide();  lyr68.hide();  lyr69.hide();  
			
			//infrastructure group layers
			lyr71.hide();  lyr72.hide();  lyr73.hide();  lyr74.hide();  lyr75.hide();  lyr76.hide();  lyr77.hide();  lyr78.hide();  lyr79.hide();  lyr80.hide();  lyr81.hide();  lyr82.hide();  
			
			//landcover
			lyr84.hide();  lyr85.hide();  lyr86.hide();  lyr87.hide();  lyr88.hide();  lyr89.hide();  lyr90.hide();  lyr91.hide();  lyr92.hide();  lyr93.hide();  lyr94.hide();  
			
			//lanscape group layers
			lyr96.hide();  lyr97.hide();  
			
			//land degradation group layers
			lyr99.hide();   
			
			//landuse spatial plan group layers
			lyr101.hide(); 
			
			//mining group layers
			lyr103.hide();  lyr104.hide();  
			
			//permits group layers
			lyr106.hide();  lyr107.hide();  lyr108.hide();  lyr109.hide();  lyr110.hide();  lyr111.hide();  lyr112.hide();  lyr113.hide();  
			
			//socio economic group layers
			lyr115.hide();  lyr116.hide();  
			
			//soil group layers
			lyr118.hide();  lyr119.hide();  lyr120.hide();   
			
			//topography group layers
			lyr122.hide();  lyr123.hide();  lyr124.hide();  lyr125.hide(); lyr126.hide();  lyr127.hide();  lyr128.hide();  lyr129.hide();  lyr130.hide();  lyr131.hide();  lyr132.hide();
			
			//label layers
			capitalLayer.hide(); labelLayer.hide();
	}
	
	function fLoadWidgets() {
		//add home button widget
		var home = new HomeButton({
			map: map
			}, "HomeButton");
		home.startup();
		
		//add all esri basemap
		var basemapGallery = new BasemapGallery({
			  showArcGISBasemaps: true,
			  map: map
			}, "basemapGalleryDiv");
		basemapGallery.startup();
		//add custom basemap
		var layer = new esri.dijit.BasemapLayer({
				url:"http://" + iAlamatLokal + ":6080/arcgis/rest/services/mcai/mca_indonesia/MapServer/4"
				//url:"http://services.arcgisonline.com/ArcGIS/services"
			});
			var basemap = new esri.dijit.Basemap({
				layers:[layer],
				title:"None",
				thumbnailUrl:"images/basebandNone.jpg"
			});
		basemapGallery.add(basemap);
		
		//add measurement widget
			var measurement = new Measurement({
			  map: map
			}, "measurementDiv");
		measurement.startup();
		
		//add scalebar
		var scalebar = new Scalebar({
			map: map,
			scalebarStyle: "ruler",
			attachTo:"bottom-left", 
			scalebarUnit: "metric"
			},dojo.byId("scalebarDiv"));		
		
		//add slider
		fCreateSlider(1, 3, "sliderGeneral");
		fCreateSlider(8, 12, "sliderAdministrative");
		fCreateSlider(14, 14, "sliderAgriculture");
		fCreateSlider(16, 20, "sliderCarbonProject");
		fCreateSlider(22, 22, "sliderClimate");
		fCreateSlider(24, 31, "sliderEcology");
		fCreateSlider(33, 36, "sliderEnergy");
		fCreateSlider(38, 45, "sliderForestry");
		fCreateSlider(52, 55, "sliderHotspot");
		fCreateSlider(57, 69, "sliderHydrology");
		fCreateSlider(71, 82, "sliderInfrastructure");
		fCreateSlider(84, 94, "sliderLandcover");
		fCreateSlider(96, 97, "sliderLandscape");
		fCreateSlider(99, 99, "sliderLandDegradation");
		fCreateSlider(101, 101, "sliderMining");
		fCreateSlider(103, 104, "sliderPermits");
		fCreateSlider(106, 113, "sliderLanduseSpatialPlan");
		fCreateSlider(115, 116, "sliderSocioEconomic");
		fCreateSlider(118, 120, "sliderSoil");
		fCreateSlider(122, 132, "sliderTopograpy");
	}
	
	function fCreateSlider(iLayerIDStart, iLayerIDEnd, iSliderDivName) {
		try {
			slider = new HorizontalSlider({
			name: "slider" + iLayerIDStart,
			value: 1,
			minimum: 0,
			maximum: 1,
			intermediateChanges: true,
			style: "250px",
			onChange: function(value){
					for (var i = iLayerIDStart; i <= iLayerIDEnd; i++) {
						map.getLayer(i).setOpacity(value);
					}			
				}
			}, iSliderDivName);
		}
		catch (err) {
			alert ("Error found");
			console.log ("fCreateSlider : " + err.message);
		}		
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
	
	function fRadioProvinceZT() {
		fComboDisableZT();
		
		dijit.byId("provinceSelectZT").attr("disabled", false);			
	}
	function fRadioDistrictZT() {
		fComboDisableZT();
		
		dijit.byId("districtSelectZT").attr("disabled", false);			
	}
	function fRadioLandscapeZT() {
		fComboDisableZT();
		
		dijit.byId("landscapeSelectZT").attr("disabled", false);			
	}
	
	function fComboDisable() {
		dijit.byId("provinceSelect").set("value","-----");
		dijit.byId("districtSelect").set("value","-----");
		dijit.byId("landscapeSelect").set("value","-----");
		
		dijit.byId("provinceSelect").attr("disabled", true);
		dijit.byId("districtSelect").attr("disabled", true);
		dijit.byId("landscapeSelect").attr("disabled", true);
	}
	
	function fComboDisableZT() {
		dijit.byId("provinceSelectZT").set("value","-----");
		dijit.byId("districtSelectZT").set("value","-----");
		dijit.byId("landscapeSelectZT").set("value","-----");
		
		dijit.byId("provinceSelectZT").attr("disabled", true);
		dijit.byId("districtSelectZT").attr("disabled", true);
		dijit.byId("landscapeSelectZT").attr("disabled", true);
	}
	
	function fLoadAreaList() {
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
				{name:"Berbak", id:"BT"},
				{name:"Sungai Tenang", id:"ST"}
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
		var processButton = new Button({
			label: "Process",
			//onClick: fAnalysis(),
		}, "processButton");
		fComboDisable();
		dijit.byId("provinceSelect").attr("disabled", false);
	}
	
	function fLoadZoomTo() {
	//set analysis combo data
		var provinceStoreZT = new Memory({
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
				{name:"Riau", id:"14"},
				{name:"Sulawesi Barat", id:"76"},
				{name:"Sulawesi Selatan", id:"73"},
				{name:"Sulawesi Tengah", id:"72"},
				{name:"Sulawesi Tenggara", id:"74"},
				{name:"Sulawesi Utara", id:"71"},
				{name:"Sumatera Barat", id:"13"},
				{name:"Sumatera Selatan", id:"16"},
				{name:"Sumatera Utara", id:"12"},
				{name:"Yogyakarta", id:"34"}*/
			]
		});
		var districtStoreZT = new Memory({
			data: [
				{name:"Muaro Jambi", id:"MJ"},
				{name:"Merangin", id:"MN"}
				
				//{name:"Mamuju", id:"MJ"},
				//{name:"Mamasa", id:"MS"}
			]
		});
		var landscapeStoreZT = new Memory({
			data: [
				{name:"Berbak", id:"BT"},
				{name:"Sungai Tenang", id:"ST"}
			]
		});
									
		var radioProvinceZT = new RadioButton({
			checked: true,
			value: "province",
			name: "rbAnalysisZT",
		}, "radioProvinceZT");
		var radioDistrictZT = new RadioButton({
			checked: false,
			value: "district",
			name: "rbAnalysisZT",
		}, "radioDistrictZT");
		var radioLandscapeZT = new RadioButton({
			checked: false,
			value: "landscape",
			name: "rbAnalysisZT",
		}, "radioLandscapeZT");
		
		var comboBox = new ComboBox({
			id: "provinceSelectZT",
			name: "province",
			value: "-----",
			store: provinceStoreZT,
			searchAttr: "name"
		}, "provinceSelectZT");
		var comboBox = new ComboBox({
			id: "districtSelectZT",
			name: "district",
			value: "-----",
			store: districtStoreZT,
			searchAttr: "name"
		}, "districtSelectZT");
		var comboBox = new ComboBox({
			id: "landscapeSelectZT",
			name: "landscape",
			value: "-----",
			store: landscapeStoreZT,
			searchAttr: "name"
		}, "landscapeSelectZT");
		var zoomToButton = new Button({
			label: "Zoom To",
			//onClick: fAnalysis(),
		}, "zoomToButton");
		fComboDisableZT();
		dijit.byId("provinceSelectZT").attr("disabled", false);
	}
		
	function fProcess() {
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
		
		if (iArea != null) {
			//mcaiLayer.hide();
			//districtLayer.hide();
			//landscapeLayer.hide();
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
					provinceLayer.setVisibleLayers([1, 4, 5]); 
					break;
					
				case 'Sulawesi Barat':
					map.centerAndZoom(esri.geometry.Point([13290258.981996706,-251660.28894105682], 
						new esri.SpatialReference({ wkid: 102100 })),8);						
					provinceLayer.setVisibleLayers([92, 95, 96]); 
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
					break;
					
				case 'Merangin':
					map.centerAndZoom(esri.geometry.Point([11360988.388079325,-245209.9867388319], 
						new esri.SpatialReference({ wkid: 102100 })),9);					
					break;
				
				case 'Mamuju':
					map.centerAndZoom(esri.geometry.Point([13279863.546149915,-200570.76222028106], 
						new esri.SpatialReference({ wkid: 102100 })),8);
					break;
					
				case 'Mamasa':
					map.centerAndZoom(esri.geometry.Point([13278640.55369733,-328526.3475696624], 
						new esri.SpatialReference({ wkid: 102100 })),10);
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
			}
			landscapeLayer.show();
		}
	}

	function fZoomTo() {
		
		var iArea, iSelectArea, iSelectAnalysis;
		
		if (dom.byId("radioProvinceZT").checked && dijit.byId("provinceSelectZT").get("value") != "-----" ) {
			iSelectArea = dijit.byId("provinceSelectZT").get("value").trim();
			iArea="1";
		};
		if (dom.byId("radioDistrictZT").checked && dijit.byId("districtSelectZT").get("value") != "-----" ) {
			iSelectArea = dijit.byId("districtSelectZT").get("value").trim();
			iArea="2";
		};
		if (dom.byId("radioLandscapeZT").checked && dijit.byId("landscapeSelectZT").get("value") != "-----" ) {
			iSelectArea = dijit.byId("landscapeSelectZT").get("value").trim();
			iArea="3";
		};
		
		//analisa untuk propinsi
		if (iArea == 1) {
			//cek nama landscape
			switch (iSelectArea)
			{
				case 'Jambi':
					map.centerAndZoom(esri.geometry.Point([11462191.013528507,-185007.200276374], 
						new esri.SpatialReference({ wkid: 102100 })),8);
					break;
					
				case 'Sulawesi Barat':
					map.centerAndZoom(esri.geometry.Point([13290258.981996706,-251660.28894105682], 
						new esri.SpatialReference({ wkid: 102100 })),8);						
					break;
			}			
		}
		
		//analisa untuk district
		if (iArea == 2) {
			//cek nama district
			switch (iSelectArea)
			{
				case 'Muaro Jambi':
					map.centerAndZoom(esri.geometry.Point([11557890.17294193,-185894.85278953813], 
						new esri.SpatialReference({ wkid: 102100 })),9);
					break;
					
				case 'Merangin':
					map.centerAndZoom(esri.geometry.Point([11360988.388079325,-245209.9867388319], 
						new esri.SpatialReference({ wkid: 102100 })),9);					
					break;
				
				case 'Mamuju':
					map.centerAndZoom(esri.geometry.Point([13279863.546149915,-200570.76222028106], 
						new esri.SpatialReference({ wkid: 102100 })),8);
					break;
					
				case 'Mamasa':
					map.centerAndZoom(esri.geometry.Point([13278640.55369733,-328526.3475696624], 
						new esri.SpatialReference({ wkid: 102100 })),10);
					break;
			}
			
			switch (iSelectArea) {
				case "Mamuju" :
					//provinceLayer.show();
					break;
					
				case "Mamasa" :
					//provinceLayer.show();
					break;
			
			}
		}
		
		//analisa untuk landscape
		if (iArea == 3) {
			//cek nama landscape
			switch (iSelectArea)
			{
				case 'Berbak':
					map.centerAndZoom(esri.geometry.Point([11594579.946518399,-168420.36513854488], 
						new esri.SpatialReference({ wkid: 102100 })),10); 
					break;
					
				case 'Sungai Tenang':
					map.centerAndZoom(esri.geometry.Point([11352427.440911409,-282511.2565419838], 
						new esri.SpatialReference({ wkid: 102100 })),12); 
					break;
			}			
		}
	}

	//end of scripts
      });
	  