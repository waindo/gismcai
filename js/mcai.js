var app = {}, map, toc, dynaLayer1, dynaLayer2, featLayer1;
var legendAgriculture = [], legendCarbonProject = [], legendClimate = [], legendEcology = [], legendEnergy = [];
var legendForestry = [], legendHazardVunerabillity = [], legendHotspot = [], legendHydrology = [];
var legendInfrastructure = [], legendLandcover = [], legendLandDegradation = [], legendMining = [];
var legendPermits = [], legendLanduseSpatialPlan = [], legendSocioEconomic = [], legendSoil = [];
var legendLayers = [], legendTopography = [], legendRainFalls = [], legendAdministrative = [];

var iAlamatLokal = "117.54.11.70";

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
	"dijit/layout/TabContainer",
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
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, TabContainer, 
		Measurement,
		TOC
	) {
		parser.parse();
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
		var basemap = map.getLayer(map.layerIds[0]);
			basemap.hide();
		
		//set for loading gif
		dojo.connect(map, "onUpdateStart", fShowLoading);
        dojo.connect(map, "onUpdateEnd", fHideLoading);

		fLoadAllLayers();
		fLoadWidgets();
		fLoadAreaList();
		fLoadZoomTo();
		
		fSetLegend();		
		fAddCategoryGroup();
		
		fHideAllFeatureLayers();	
		fKosongDiv();
		
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
	//------------------------
	//-- all functions --
	//------------------------
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
		
		var iMapServicesFolder = "http://" + iAlamatLokal + ":6080/arcgis/rest/services/data/";
		var iFeatureFolder = iMapServicesFolder + "indonesia/MapServer/";
		
		indonesiaBackgroundLayer = new FeatureLayer(iMapServicesFolder + "mcai_indonesia/MapServer/4", {}); //new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "indonesia/MapServer", {});
		indonesiaLayer = new FeatureLayer(iMapServicesFolder + "mcai_indonesia/MapServer/4", {id:"4"});
				
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
		  
		mcaiH = new FeatureLayer(iMapServicesFolder + "mcai_indonesia/MapServer/1", {});
		legendLayers.push({ layer: mcaiH, title: 'Community-based Health and Nutrition to Reduce Stunting Project' });
		mcaiPM = new FeatureLayer(iMapServicesFolder + "mcai_indonesia/MapServer/2", {});
		legendLayers.push({ layer: mcaiPM, title: 'Procurement Modernization Project' });
		mcaiGP = new FeatureLayer(iMapServicesFolder + "mcai_indonesia/MapServer/3", {});
		legendLayers.push({ layer: mcaiGP, title: 'Green Prosperity Project' });
		
		
		/*
		landscapeFeatureLayer = new FeatureLayer(iMapServicesFolder + "Indonesia/MapServer/207", {
			mode: FeatureLayer.MODE_SNAPSHOT,
			infoTemplate: infoTemplate,
			opacity: 0,
			outFields: ["*"]
		});
		*/
		
		//add for category analysis layers
		//----- administrative group -----
		villageFeatureLayer = new FeatureLayer(iMapServicesFolder + "indonesia/MapServer/9", {
			id:"9",
			mode: FeatureLayer.MODE_SNAPSHOT,
			infoTemplate: infoTemplateDetail,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: villageFeatureLayer, title: 'Village Boundary' });
		subDistrictFeatureLayer = new FeatureLayer(iMapServicesFolder + "indonesia/MapServer/8", {
			id:"8",
			mode: FeatureLayer.MODE_SNAPSHOT,
			infoTemplate: infoTemplate,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: subDistrictFeatureLayer, title: 'Sub District Boundary' });
		districtFeatureLayer = new FeatureLayer(iMapServicesFolder + "indonesia/MapServer/7", {
			id:"7",
			mode: FeatureLayer.MODE_SNAPSHOT,
			infoTemplate: infoTemplate,
			outFields: ["*"]
		});
		legendAdministrative.push({ layer: districtFeatureLayer, title: 'District Boundary' });		
		lyr6 = new FeatureLayer(iFeatureFolder + "6", {id:"6"});
		legendAdministrative.push({ layer: lyr6, title: 'Capital Sub District' });
		lyr5 = new FeatureLayer(iFeatureFolder + "5", {id:"5"});
		legendAdministrative.push({ layer: lyr5, title: 'Capital District' });
		
		//----- agriculture group -----
		/*
		sugarcaneLayer = new FeatureLayer(iFeatureFolder + "16", {id:"16"});
		legendAgriculture.push({ layer: sugarcaneLayer, title: 'Sugarcane' });
		*/
		plantationLayer = new FeatureLayer(iFeatureFolder + "15", {id:"15", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendAgriculture.push({ layer: plantationLayer, title: 'Plantation Concession' });
		/*
		paddyFieldLayer = new FeatureLayer(iFeatureFolder + "14", {id:"14"});
		legendAgriculture.push({ layer: paddyFieldLayer, title: 'Paddy Field' });
		fishingLayer = new FeatureLayer(iFeatureFolder + "13", {id:"13"});
		legendAgriculture.push({ layer: fishingLayer, title: 'Fishing' });
		ecologyLayer = new FeatureLayer(iFeatureFolder + "12", {id:"12", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendAgriculture.push({ layer: ecologyLayer, title: 'Ecology' });
		cropLandLayer = new FeatureLayer(iFeatureFolder + "11", {id:"11", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendAgriculture.push({ layer: cropLandLayer, title: 'Cropland' });
		*/
		
		//----- carbon project -----
		lyr23 = new FeatureLayer(iFeatureFolder + "23", {id:"23"});
		legendCarbonProject.push({ layer: lyr23, title: 'Sampling Location (ICRAF)' });
		lyr22 = new FeatureLayer(iFeatureFolder + "22", {id:"22"});
		legendCarbonProject.push({ layer: lyr22, title: 'Permanent Forest Plots (ZSL)' });
		//lyr21 = new FeatureLayer(iFeatureFolder + "21", {id:"21"});
		//legendCarbonProject.push({ layer: lyr21, title: 'Climate and Land Use Alliance' });
		lyr20 = new FeatureLayer(iFeatureFolder + "20", {id:"20"});
		legendCarbonProject.push({ layer: lyr20, title: 'Carbon Stock (MoF)' });
		lyr19 = new FeatureLayer(iFeatureFolder + "19", {id:"19"});
		legendCarbonProject.push({ layer: lyr19, title: 'Carbon Measurement Points (ZSL)' });
		lyr18 = new FeatureLayer(iFeatureFolder + "18", {id:"18"});
		legendCarbonProject.push({ layer: lyr18, title: 'Berbak NP Carbon Initiative' });
		
		//----- climate -----
		lyr25 = new FeatureLayer(iFeatureFolder + "25", {id:"25", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendClimate.push({ layer: lyr25, title: 'Rain Falls' });
		
		//----- ecology -----
		lyr35 = new FeatureLayer(iFeatureFolder + "35", {id:"35"});
		legendEcology.push({ layer: lyr35, title: 'Tiger Distribution' });
		lyr34 = new FeatureLayer(iFeatureFolder + "34", {id:"34", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr34, title: 'Important Ecosystem' });
		lyr33 = new FeatureLayer(iFeatureFolder + "33", {id:"33"});
		legendEcology.push({ layer: lyr33, title: 'HCV 3 – Endangered Ecosystem' });
		lyr32 = new FeatureLayer(iFeatureFolder + "32", {id:"32"});
		legendEcology.push({ layer: lyr32, title: 'HCV 2 – Important Natural Landscapes' });
		lyr31 = new FeatureLayer(iFeatureFolder + "31", {id:"31"});
		legendEcology.push({ layer: lyr31, title: 'HCV 1.2 - Threatened and Endangered Species (WWF)' });
		lyr30 = new FeatureLayer(iFeatureFolder + "30", {id:"30"});
		legendEcology.push({ layer: lyr30, title: 'HCV 1.1 - Wild Plant Sanctuaries (WWF)' });
		lyr29 = new FeatureLayer(iFeatureFolder + "29", {id:"29"});
		legendEcology.push({ layer: lyr29, title: 'Elephant Distribution' });
		lyr28 = new FeatureLayer(iFeatureFolder + "28", {id:"28", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendEcology.push({ layer: lyr28, title: 'Ecoregion (WWF)' });
		//lyr27 = new FeatureLayer(iFeatureFolder + "27", {id:"27"});
		//legendEcology.push({ layer: lyr27, title: 'Biodiversity Tiger TNKS' });
		
		//----- energy -----
		lyr37c = new FeatureLayer(iFeatureFolder + "126", {id:"126"});
		legendEnergy.push({ layer: lyr37c, title: 'RE Microhydro (Merangin)' });
		lyr37b = new FeatureLayer(iFeatureFolder + "177", {id:"177"});
		legendEnergy.push({ layer: lyr37b, title: 'Power Plants (Muaro Jambi)' });
		lyr37a = new FeatureLayer(iFeatureFolder + "125", {id:"125"});
		legendEnergy.push({ layer: lyr37a, title: 'Power Plants (Merangin)' });
		lyr37 = new FeatureLayer(iFeatureFolder + "37", {id:"37"});
		legendEnergy.push({ layer: lyr37, title: 'Transmission Line' });
		
		//----- forestry -----
		lyr47 = new FeatureLayer(iFeatureFolder + "47", {id:"47", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr47, title: 'Existing Forest Cover' });
		lyr46 = new FeatureLayer(iFeatureFolder + "46", {id:"46", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr46, title: 'Tenurial Forest' });
		lyr45 = new FeatureLayer(iFeatureFolder + "45", {id:"45", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr45, title: 'Village Forest' });
		lyr44 = new FeatureLayer(iFeatureFolder + "44", {id:"44", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr44, title: 'Rimba Corridor' });
		//lyr43 = new FeatureLayer(iFeatureFolder + "43", {id:"43", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		//legendForestry.push({ layer: lyr43, title: 'HPHTI' });
		lyr42 = new FeatureLayer(iFeatureFolder + "42", {id:"42", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr42, title: 'Forest Management Unit' });
		lyr41 = new FeatureLayer(iFeatureFolder + "41", {id:"41", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr41, title: 'Forest Conservation Activities' });
		lyr40 = new FeatureLayer(iFeatureFolder + "40", {id:"40", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr40, title: 'Forest Production Moratorium' });
		lyr39 = new FeatureLayer(iFeatureFolder + "39", {id:"39", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr39, title: 'Forest Status' });
		/*
		//----- hazard vulnerability -----
		lyr52 = new FeatureLayer(iFeatureFolder + "52", {id:"52", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr52, title: 'Dryness BNPB' });
		lyr51 = new FeatureLayer(iFeatureFolder + "51", {id:"51", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr51, title: 'Earthquake BNPB' });
		lyr50 = new FeatureLayer(iFeatureFolder + "50", {id:"50", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr50, title: 'Flood BNPB' });
		lyr49 = new FeatureLayer(iFeatureFolder + "49", {id:"49", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendHazardVunerabillity.push({ layer: lyr49, title: 'Forest File and Land BNPB' });
		*/
		//----- hotspot -----
		lyr57 = new FeatureLayer(iFeatureFolder + "57", {id:"57"});
		legendHotspot.push({ layer: lyr57, title: 'Hotspot Distribution (2012)' });
		
		//----- hydrology -----
		lyr62 = new FeatureLayer(iFeatureFolder + "62", {id:"62"});
		legendHydrology.push({ layer: lyr62, title: 'Watershed Boundary' });
		lyr61 = new FeatureLayer(iFeatureFolder + "61", {id:"61"});
		legendHydrology.push({ layer: lyr61, title: 'River' });
		lyr60 = new FeatureLayer(iFeatureFolder + "60", {id:"60"});
		legendHydrology.push({ layer: lyr60, title: 'Main River' });
		
		//----- Infrastructure -----
		lyr65 = new FeatureLayer(iFeatureFolder + "65", {id:"65"});
		legendInfrastructure.push({ layer: lyr65, title: 'Other Road' });
		lyr64 = new FeatureLayer(iFeatureFolder + "64", {id:"64"});
		legendInfrastructure.push({ layer: lyr64, title: 'Main Road' });
		
		//----- Landcover -----
		lyr68 = new FeatureLayer(iFeatureFolder + "68", {id:"68", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr68, title: 'Landcover 2011 (MoF)' });
		
		//----- land degradation -----
		//lyr71 = new FeatureLayer(iFeatureFolder + "71", {id:"71", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		//legendLandDegradation.push({ layer: lyr71, title: 'Gerhan' });
		lyr70 = new FeatureLayer(iFeatureFolder + "70", {id:"70", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendLandDegradation.push({ layer: lyr70, title: 'Critical Land' });
		
		//----- landuse spatial plan -----
		lyr73 = new FeatureLayer(iFeatureFolder + "73", {id:"73", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendLanduseSpatialPlan.push({ layer: lyr73, title: 'Draft RTRW Landuse Spatial Plan' });
		
		//----- mining -----
		lyr76 = new FeatureLayer(iFeatureFolder + "76", {id:"76", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendMining.push({ layer: lyr76, title: 'Oil and Gas Cocenssion' });
		lyr75 = new FeatureLayer(iFeatureFolder + "75", {id:"75", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendMining.push({ layer: lyr75, title: 'Mining Concession' });
		
		//----- permits -----
		lyr85 = new FeatureLayer(iFeatureFolder + "85", {id:"85", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr85, title: 'Permit to Utilize Forest Product in Ecological Restoration' });
		lyr84 = new FeatureLayer(iFeatureFolder + "84", {id:"84", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr84, title: 'Permit to Utilize Forest Product in Community Timber Estate' });
		lyr83 = new FeatureLayer(iFeatureFolder + "83", {id:"83", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr83, title: 'Permit to Utilize Forest Product in Timber Estate' });
		lyr82 = new FeatureLayer(iFeatureFolder + "82", {id:"82", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr82, title: 'Permit to Utilize Forest Product in Natural Forest' });
		lyr81 = new FeatureLayer(iFeatureFolder + "81", {id:"81", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr81, title: 'Land Cultivation Right (HGU)' });
		lyr80 = new FeatureLayer(iFeatureFolder + "80", {id:"80", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr80, title: 'Forest Land Swap (IPPKH)' });
		lyr79 = new FeatureLayer(iFeatureFolder + "79", {id:"79", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr79, title: 'Forest Conversion to Plantation Development' });
		lyr78 = new FeatureLayer(iFeatureFolder + "78", {id:"78", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendPermits.push({ layer: lyr78, title: 'Forest Conversion to Transmigration Development' });
		
		//----- socio economic -----
		lyr88 = new FeatureLayer(iFeatureFolder + "88", {id:"88", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendSocioEconomic.push({ layer: lyr88, title: 'Population Distribution' });
		lyr87 = new FeatureLayer(iFeatureFolder + "87", {id:"87", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendSocioEconomic.push({ layer: lyr87, title: 'Indigenous People' });
		
		//----- soil -----
		lyr92 = new FeatureLayer(iFeatureFolder + "92", {id:"92", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr92, title: 'Peat Soil' });
		lyr91 = new FeatureLayer(iFeatureFolder + "91", {id:"91", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr91, title: 'Soil' });
		lyr90 = new FeatureLayer(iFeatureFolder + "90", {id:"90", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr90, title: 'Fault' });
		
		//----- topography -----
		lyr94 = new FeatureLayer(iFeatureFolder + "94", {id:"94", mode: FeatureLayer.MODE_SNAPSHOT,infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr94, title: 'Topographic Map' });
		
		map.addLayers([
			indonesiaBackgroundLayer, 
			//mcaiLayer, 	
			//provinceLayer, 
			//districtLayer, 
			mcaiGP, mcaiH, mcaiPM,
			//administrative group layers
			districtFeatureLayer, subDistrictFeatureLayer, villageFeatureLayer, lyr5, lyr6,
			
			//landscapeFeatureLayer,
				
			//agriculture group layers
			//cropLandLayer, ecologyLayer, fishingLayer, paddyFieldLayer, 
			plantationLayer, 
			//sugarcaneLayer, 
			//carbon project group layers
			lyr18, lyr19, lyr20, //lyr21, 
			lyr22, lyr23, 
			//climate group layers
			lyr25,
			//ecology group layers
			//lyr27, 
			lyr28, lyr29, lyr30, lyr31, lyr32, lyr33, lyr34, lyr35, 
			//energy group layers
			lyr37, lyr37a, lyr37b, lyr37c, 
			//forestry
			lyr39, lyr40, lyr41, lyr42, //lyr43, 
			lyr44, lyr45, lyr46, lyr47,
			/*
			//hazard vulnerability
			lyr49, lyr50, lyr51, lyr52, 
			*/
			//hotspot
			lyr57,
			//hydrology
			lyr60, lyr61, lyr62, 
			//infrastructure
			lyr64, lyr65, 
			//landcover
			lyr68, 
			//land degradation
			lyr70, //lyr71, 
			//landuse spatial plan
			lyr73, 
			//mining
			lyr75, lyr76, 
			//permits
			lyr78, lyr79, lyr80, lyr81, lyr82, lyr83, lyr84, lyr85, 
			//socio economic
			lyr87, lyr88, 
			//soil
			lyr90, lyr91, lyr92, 
			//topography
			lyr94
		]);
		
		console.log("load service layer success");
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
		
		for (var i = 1; i < 95; i++) {
			//district layer
			if (i == "7" && map.getLayer(i).visible) {			
				iKet1 = "District";				
				iKet2 = "Polygon showing district boundary of Jambi Province.";
				iKet3 = "BPS";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
			}
			
			//subdistrict layer
			if (i == "8" && map.getLayer(i).visible) {			
				iKet1 = "Sub District";				
				iKet2 = "Polygon showing sub district boundary of Jambi Province.";
				iKet3 = "BPS";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
			}
			
			//village layer
			if (i == "9" && map.getLayer(i).visible) {			
				iKet1 = "Village";				
				iKet2 = "Polygon showing village boundary of Jambi Province.";
				iKet3 = "BPS";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
			}
			
			//plantation concession layer
			if (i == "15" && map.getLayer(i).visible) {			
				iKet1 = "Plantation Concession";
				
				iKet2 = "Palm oil plantations polygon in Jambi province, scale 1:250.000. The data contains commodities such as cocoa, rubber, and ";
				iKet2 = iKet2 + "oil palm. Update 2012. Data was verified with tabular data released by the Department of Plantation in Jambi Province. ";
				iKet2 = iKet2 + "PTHI added types of permits, no SK, Description, and SK Date.";
				
				iKet3 = "Disbun & PT. Hatfield Indonesia (PTHI)";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
			}

			//berbak np carbon initiative layer
			if (i == "18" && map.getLayer(i).visible) {
				iKet1 = "Berbak NP Carbon";
				
				iKet2 = "Polygon showing location of carbon project, which is based on MoU between Zoological Society of London (ZSL) Indonesia and  Berbak National Park signed on October 12th 2011.  ";
				iKet2 = iKet2 + "The MoU aims to reduce emission from deforestation and degradation in ";
				iKet2 = iKet2 + "Berbak National Park, which includes 3 year work plan to achieve self-financing, sustainable conservation of the area.";

				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}

			//carbon measurement layer
			if (i == "19" && map.getLayer(i).visible) {
				iKet1 = "Carbon Measurement Points (ZSL)";
				
				iKet2 = "Points showing location of carbon measurement in Berbak National Park";
				
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//carbon stock layer
			if (i == "20" && map.getLayer(i).visible) {
				iKet1 = "Carbon Stock (MoF)";
				
				iKet2 = "Carbon stock estimation, which was derived by landcover and carbon value. ";
				iKet2 = iKet2 + "Carbon value calculated based on reference from IPCC. Scale 1:250.000";
				
				iKet3 = "MoF & PTHI";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//permanent forest layer
			if (i == "22" && map.getLayer(i).visible) {
				iKet1 = "Permanent Forest Plots (ZSL)";
				iKet2 = "Points showing location of permanent forest plots in Berbak National Park";
				iKet3 = "MoF & PTHI";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//sampling location layer
			if (i == "23" && map.getLayer(i).visible) {
				iKet1 = "Sampling Location (ICRAF)";
				iKet2 = "Carbon measurement sampling for ALREDDI-ICRAF year 2012. ";
				iKet2 = iKet2 + "The map derived from coordinate of sampling location.";
				iKet3 = "ICRAF report & PTHI.";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//rain falls layer
			if (i == "25" && map.getLayer(i).visible) {
				iKet1 = "Rain Falls";
				iKet2 = "Precipitation data in Jambi Province, scale 1:250.000. Based  on landsystem 1987. ";
				iKet3 = "BIG";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}

			//tiger distribution layer
			/*
			if (i == "27" && map.getLayer(i).visible) {
				iKet1 = "Tiger Distribution";
				iKet2 = "Polygon showing tiger habitat in Sumatra, based on area  of 250km2 assumption which is the smallest area for tiger to be able to live.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			*/
			
			//elephant distribution layer
			if (i == "29" && map.getLayer(i).visible) {
				iKet1 = "Elephant Distribution";
				iKet2 = "Polygon showing elephant distribution in Sumatera. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//hcv 1 1 layer
			if (i == "30" && map.getLayer(i).visible) {
				iKet1 = "HCV 1.1 - Wild Plant Sanctuaries (WWF)";
				iKet2 = "Polygon showing wild plant sanctuary area to support biodiversity.  The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//hcv 1 2 layer
			if (i == "31" && map.getLayer(i).visible) {
				iKet1 = "HCV 1.2 - Threatened and Endangered Species (WWF)";
				iKet2 = "Polygon showing threatens and endangered species ecosystem. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//hcv 2 layer
			if (i == "32" && map.getLayer(i).visible) {
				iKet1 = "HCV 2 – Important Natural Landscapes";
				iKet2 = "Polygon showing natural landscapes, which has capacity to maintain natural ecology processes and dynamics. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//hcv 3 layer
			if (i == "33" && map.getLayer(i).visible) {
				iKet1 = "HCV 3 – Endangered Ecosystem ";
				iKet2 = "Polygon showing rare and endangered ecosystem. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//ecoregions layer
			if (i == "28" && map.getLayer(i).visible) {
				iKet1 = "Ecoregion (WWF)";
				iKet2 = "Polygon showing econame and regions in Sumatera 1999 - 2000. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//importan ecosystem layer
			if (i == "34" && map.getLayer(i).visible) {
				iKet1 = "Important Ecosystem";
				iKet2 = "Polygon showing Important ecosystem. The map was published in www.savesumatera.org.";
				iKet3 = "WWF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//transmission line layer
			if (i == "37" && map.getLayer(i).visible) {
				iKet1 = "Transmission Line";
				iKet2 = "Line showing existing transmission line in Jambi.";
				iKet3 = "Bappeda";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest land status layer
			if (i == "39" && map.getLayer(i).visible) {
				iKet1 = "Forest Status";
				iKet2 = "Polygon showing forest function (Protected Forest, Production Forest, Limited Production Forest, etc)";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//ppib layer
			if (i == "40" && map.getLayer(i).visible) {
				iKet1 = "Forest Production Moratorium";
				iKet2 = "Polygon showing forest production moratorium in Jambi.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest conservation alliance layer
			if (i == "41" && map.getLayer(i).visible) {
				iKet1 = "Forest Concession Activities";
				iKet2 = "Polygon showing forest conservation activities in Jambi.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest management unit layer
			if (i == "42" && map.getLayer(i).visible) {
				iKet1 = "Forest Management Unit";
				iKet2 = "Polygon showing forest management unit.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//rimba corridor layer
			if (i == "44" && map.getLayer(i).visible) {
				iKet1 = "Rimba Corridor";
				iKet2 = "Polygon showing Rimba Corridor in Sumatera";
				iKet3 = "MCC dataset";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//village forest layer
			if (i == "45" && map.getLayer(i).visible) {
				iKet1 = "Village Forest";
				iKet2 = "Polygon showing village forest management.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//tenurial forest alliance layer
			if (i == "46" && map.getLayer(i).visible) {
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
			if (i == "57" && map.getLayer(i).visible) {
				iKet1 = "Hotspot Distribution (2012)";
				iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 1999 - 2012.";
				iKet3 = "USGS";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//watershed boundary layer
			if (i == "62" && map.getLayer(i).visible) {
				iKet1 = "Watershed Boundary";
				iKet2 = "Polygon showing watershed boundary based on SK 511/Menhut-V/2011.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//river big layer
			if (i == "60" && map.getLayer(i).visible) {
				iKet1 = "Main River";
				iKet2 = "Polygon showing main river.";
				iKet3 = "BIG";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//river small layer
			if (i == "61" && map.getLayer(i).visible) {
				iKet1 = "River";
				iKet2 = "Polygon showing smaller river.";
				iKet3 = "BIG";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
						
			//landcover layer
			if (i == "68" && map.getLayer(i).visible) {
				iKet1 = "Landcover 2011 (MoF)";
				iKet2 = "Polygon showing landcover in Jambi.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//critical land layer
			if (i == "70" && map.getLayer(i).visible) {
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
			if (i == "73" && map.getLayer(i).visible) {
				iKet1 = "Landuse Spatial Plan";
				iKet2 = "Polygon showing the draft of RTRW of Jambi.";
				iKet3 = "Bappeda";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//mining concession layer
			if (i == "75" && map.getLayer(i).visible) {
				iKet1 = "Mining Cocenssion";
				iKet2 = "Polygon showing mining concession, including the name of the company and status of concession.";
				iKet3 = "Bappeda & ESDM";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//oil and gas concession layer
			if (i == "76" && map.getLayer(i).visible) {
				iKet1 = "Oil and Gas Concession";
				iKet2 = "Polygon showing oil and gas concession, including, block name, company name, and status of concession.";
				iKet3 = "Petromindo, ESDM, PTHI";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest area release layer
			if (i == "78" && map.getLayer(i).visible) {
				iKet1 = "Forest Conversion to Transmigration Development";
				iKet2 = "Polygon showing forest conversion to transmigrasi, including license number(no SK), date and area.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest area release plantation layer
			if (i == "79" && map.getLayer(i).visible) {
				iKet1 = "Forest Conversion to Plantation Development";
				iKet2 = "Polygon showing forest conversion to oil palm plantation, including company name, license number(no SK), date and area.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//forest land swap layer
			if (i == "80" && map.getLayer(i).visible) {
				iKet1 = "Forest Land Swap (IPPKH)";
				iKet2 = "Polygon showing forest temporary use (pinjam pakai) for mining including the name of company and license number.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//hgu layer
			if (i == "81" && map.getLayer(i).visible) {
				iKet1 = "Land Cultivation Right (HGU)";
				iKet2 = "Polygon showing plantations permits.";
				iKet3 = "BPN";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//iuphhk ha layer
			if (i == "82" && map.getLayer(i).visible) {
				iKet1 = "Permit to Utilize Forest Product in Natural Forest";
				iKet2 = "Polygon showing timber concessions in Jambi province. Issued on 2013.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//iuphhk hti layer
			if (i == "83" && map.getLayer(i).visible) {
				iKet1 = "Permit to Utilize Forest Product in Timber Estate";
				iKet2 = "Polygon showing industrial timber plantation concessions in Jambi province. Issued on 2013.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//iuphhk htr layer
			if (i == "84" && map.getLayer(i).visible) {
				iKet1 = "Permit to Utilize Forest Product in Community Timber Estate";
				iKet2 = "Polygon showing forest plantation managed by local people.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//iuphhk re layer
			if (i == "85" && map.getLayer(i).visible) {
				iKet1 = "Permit to Utilize Forest Product in Ecological Restoration";
				iKet2 = "Polygon showing location of ecosystem restoration in Jambi.";
				iKet3 = "MoF";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//indigenous people layer
			if (i == "87" && map.getLayer(i).visible) {
				iKet1 = "Indigenous People";
				iKet2 = "Point showing location of indigenous people.";
				iKet3 = "unknown";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//distribution of the population layer
			if (i == "88" && map.getLayer(i).visible) {
				iKet1 = "Population Distribution";
				iKet2 = "Polygon showing administrative boundary with attribute contains number and density of population.";
				iKet3 = "Bappeda";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//fault layer
			if (i == "90" && map.getLayer(i).visible) {
				iKet1 = "Fault";
				iKet2 = "Line showing fault line in Jambi.";
				iKet3 = "Bappeda";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//soil layer
			if (i == "91" && map.getLayer(i).visible) {
				iKet1 = "Soil";
				iKet2 = "Polygon showing soil types based on USDA soil classification.";
				iKet3 = "MoA";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//peat soil layer
			if (i == "92" && map.getLayer(i).visible) {
				iKet1 = "Peat Soil";
				iKet2 = "Polygon showing peat soil including type and depth of the peat soil.";
				iKet3 = "MoA";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			//topographic layer
			if (i == "94" && map.getLayer(i).visible) {
				iKet1 = "Topographic";
				iKet2 = "Line showing contour/elevation line based on RBI map scale 1:50.000.";
				iKet3 = "BIG";
				
				iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
			}
			
			
			
			
			
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
		/*
		mcaiLayer.hide();
		provinceLayer.setVisibleLayers([]);
		provinceLayer.hide();
		districtLayer.setVisibleLayers([]);
		districtLayer.hide();
		landscapeLayer.setVisibleLayers([]);
		landscapeLayer.hide();		
		*/
		
		//argoEcologyZoneLayer.setVisibility();
		//indonesiaBackgroundLayer.hide();
		indonesiaLayer.hide();
		mcaiGP.hide(); mcaiH.hide(); mcaiPM.hide();
			
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
		dom.byId("legendLandDegradationDiv").innerHTML="";
		dom.byId("legendMiningDiv").innerHTML="";
		dom.byId("legendPermitsDiv").innerHTML="";
		dom.byId("legendLanduseSpatialPlanDiv").innerHTML="";
		dom.byId("legendSocioEconomicDiv").innerHTML="";
		dom.byId("legendSoilDiv").innerHTML="";
		dom.byId("legendTopographyDiv").innerHTML="";
	}
	function fHideAllFeatureLayers() {
		// mcai project
		mcaiGP.hide(); mcaiH.hide(); mcaiPM.hide();
		//administrative
		districtFeatureLayer.hide(); subDistrictFeatureLayer.hide(); villageFeatureLayer.hide(); lyr5.hide(); lyr6.hide();
		
		//agriculture group layers
		//cropLandLayer.hide(); ecologyLayer.hide(); fishingLayer.hide(); paddyFieldLayer.hide(); 
		plantationLayer.hide(); 
		//sugarcaneLayer.hide();
		//carbon project group layers
		lyr18.hide(); lyr19.hide(); lyr20.hide(); //lyr21.hide(); 
		lyr22.hide(); lyr23.hide();
		//climate group layers
		lyr25.hide();
		//ecology group layers
		//lyr27.hide(); 
		lyr28.hide(); lyr29.hide(); lyr30.hide(); lyr31.hide(); lyr32.hide(); lyr33.hide(); lyr34.hide(); lyr35.hide(); 
		//energy group layers
		lyr37.hide(); lyr37a.hide(); lyr37b.hide(); lyr37c.hide();
		//forestry
		lyr39.hide(); lyr40.hide(); lyr41.hide(); lyr42.hide(); //lyr43.hide(); 
		lyr44.hide(); lyr45.hide(); lyr46.hide(); lyr47.hide();
		/*
		//hazard vulnerability
		lyr49.hide(); lyr50.hide(); lyr51.hide(); lyr52.hide(); 
		*/
		//hotspot
		lyr57.hide();
		//hydrology
		lyr60.hide(); lyr61.hide(); lyr62.hide(); 
		//infrastructure
		lyr64.hide(); lyr65.hide(); 
		//landcover
		lyr68.hide(); 
		//land degradation
		lyr70.hide(); //lyr71.hide(); 
		//landuse spatial plan
		lyr73.hide(); 
		//mining
		lyr75.hide(); lyr76.hide(); 
		//permits
		lyr78.hide(); lyr79.hide(); lyr80.hide(); lyr81.hide(); lyr82.hide(); lyr83.hide(); lyr84.hide(); lyr85.hide(); 
		//socio economic
		lyr87.hide(); lyr88.hide(); 
		//soil
		lyr90.hide(); lyr91.hide(); lyr92.hide(); 
		//topography
		lyr94.hide();		
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
		
		//add print button		
		var printer = new Print({
			map: map,
			templates: "",
			url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
		}, dom.byId("printButton"));
		printer.startup();
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
		var districtStoreZT = new Memory({
			data: [
				{name:"Muaro Jambi", id:"MJ"},
				{name:"Merangin", id:"MN"},
				{name:"Mamuju", id:"MJ"},
				{name:"Mamasa", id:"MS"}
			]
		});
		var landscapeStoreZT = new Memory({
			data: [
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
					provinceLayer.show();break;
				case "Mamasa" :
					provinceLayer.show();break;
				default : districtLayer.show();break;
			}
		}
		
		//analisa untuk landscape
		if (iArea == 3) {
			//cek nama landscape
			switch (iSelectArea)
			{
				case 'Sungai Tenang':
					map.centerAndZoom(esri.geometry.Point([11352427.440911409,-282511.2565419838], 
						new esri.SpatialReference({ wkid: 102100 })),11); 
			}			
		}
	}

	//end of scripts
      });
	  