var app = {}, map, toc, dynaLayer1, dynaLayer2, featLayer1;
var legendCarbonProject = [], legendClimate = [], legendEcology = [], legendEnergy = [];
var legendForestry = [], legendHazardVunerabillity = [], legendHotspot = [], legendHydrology = [];
var legendInfrastructure = [], legendLandcover = [], legendLandDegradation = [], legendMining = [];
var legendPermits = [], legendLanduseSpatialPlan = [], legendSocioEconomic = [], legendSoil = [];
var legendLayers = [], legendTopography = [], legendRainFalls = [];

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
		
		fHideAllFeatureLayers();		
		fAddCategoryGroup();

		//event when user content pane
		on(dom.byId("HomeButton"), "click", fHomeButton);
		
		on(dom.byId("radioProvince"), "click", fRadioProvince);
		on(dom.byId("radioDistrict"), "click", fRadioDistrict);
		on(dom.byId("radioLandscape"), "click", fRadioLandscape);
		
		on(dom.byId("radioProvinceZT"), "click", fRadioProvinceZT);
		on(dom.byId("radioDistrictZT"), "click", fRadioDistrictZT);
		on(dom.byId("radioLandscapeZT"), "click", fRadioLandscapeZT);
		
		on(dom.byId("processButton"), "click", fProcess);
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
		indonesiaBackgroundLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Indonesia_Background/MapServer", {
		});
		indonesiaLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		mcaiLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_indonesia/MapServer", {
		});
		legendLayers.push({ layer: mcaiLayer, title: 'MCA - Indonesia' });
		provinceLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Province/MapServer", {
		});
		districtLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/District/MapServer", {
		});
		
		subDistrictMeranginFeatureLayer = new FeatureLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_merangin/MapServer/4", {
			mode: FeatureLayer.MODE_SNAPSHOT,
			opacity: 0,
			outFields: ["*"]
		});
		
		landscapeLayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/MCA_I/Landscape/MapServer", {
		//landscapeLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_Landscape_analysis/MapServer", {
		});
		
		console.log("load service layer success");
		
		//add for category analysis layers
		var iFeatureFolder = "http://localhost:6080/arcgis/rest/services/MCA_I/Province/MapServer/";
		
		//----- agriculture group -----
		argoEcologyZoneLayer = new FeatureLayer(iFeatureFolder + "8", {
          id: '8'
        });
		legendLayers.push({ layer: argoEcologyZoneLayer, title: 'Argo Ecology Zone' });
		cropLandAgricultureLayer = new FeatureLayer(iFeatureFolder + "9", {
          id: '9'
        });
		legendLayers.push({ layer: cropLandAgricultureLayer, title: 'Cropland Agriculture' });
		fishingAreaLayer = new FeatureLayer(iFeatureFolder + "10", {
          id: '10'
        });
		legendLayers.push({ layer: fishingAreaLayer, title: 'Fishing Area' });
		paddyFieldLayer = new FeatureLayer(iFeatureFolder + "11", {
          id: '11'
        });
		legendLayers.push({ layer: paddyFieldLayer, title: 'Paddy Field' });
		sugarCaneLayer = new FeatureLayer(iFeatureFolder + "12", {
          id: '12'
        });
		legendLayers.push({ layer: sugarCaneLayer, title: 'Sugar Cane' });
		plantationConcessionLayer = new FeatureLayer(iFeatureFolder + "13", {
          id: '13'
        });
		legendLayers.push({ layer: plantationConcessionLayer, title: 'Plantation Concession' });
		console.log("load feature layer - agriculture success");
		
		//----- carbon project -----
		carbonMeasurementPointLayer = new FeatureLayer(iFeatureFolder + "15", {
          id: '15'
        });
		legendCarbonProject.push({ layer: carbonMeasurementPointLayer, title: 'Carbon Measurement Point' });
		permanentForestPlotsLayer = new FeatureLayer(iFeatureFolder + "16", {
          id: '16'
        });
		legendCarbonProject.push({ layer: permanentForestPlotsLayer, title: 'Permanent Forest Plots' });
		samplingLocationLayer = new FeatureLayer(iFeatureFolder + "17", {
          id: '17'
        });
		legendCarbonProject.push({ layer: samplingLocationLayer, title: 'Sampling Location' });
		npCarbonInitiativeLayer = new FeatureLayer(iFeatureFolder + "18", {
          id: '18'
        });
		legendCarbonProject.push({ layer: npCarbonInitiativeLayer, title: 'NP Carbon Initiative' });
		carbonStockMoFLayer = new FeatureLayer(iFeatureFolder + "19", {
          id: '19'
        });
		legendCarbonProject.push({ layer: carbonStockMoFLayer, title: 'Carbon Stock MoF' });
		climateAndLanduseAllianceLayer = new FeatureLayer(iFeatureFolder + "20", {
          id: '20'
        });
		legendCarbonProject.push({ layer: climateAndLanduseAllianceLayer, title: 'Climate and Landuse Alliance' });
		console.log("load feature layer - carbon success");
		
		//----- climate -----
		rainFallsLayer = new FeatureLayer(iFeatureFolder + "22", {id: '22'});
		legendClimate.push({ layer: rainFallsLayer, title: 'Rain Falls' });
		console.log("load feature layer - climate success");
		
		//----- ecology -----
		ecologyRegionLayer = new FeatureLayer(iFeatureFolder + "24", {id: '24'});
		legendEcology.push({ layer: ecologyRegionLayer, title: 'Ecology Region' });
		//climateAndLanduseAllianceLayer = new FeatureLayer(iFeatureFolder + "20", {id: '20'});
		//legendCarbonProject.push({ layer: climateAndLanduseAllianceLayer, title: 'Climate and Landuse Alliance' });
		tigerDistributionLayer = new FeatureLayer(iFeatureFolder + "26", {id: '26'});
		legendEcology.push({ layer: tigerDistributionLayer, title: 'Tiger Distribution' });
		elephanDistributionLayer = new FeatureLayer(iFeatureFolder + "27", {id: '27'});
		legendEcology.push({ layer: elephanDistributionLayer, title: 'Elephan Distribution' });
		hvc11Layer = new FeatureLayer(iFeatureFolder + "28", {id: '28'});
		legendEcology.push({ layer: hvc11Layer, title: 'HVC 1 1' });
		hvc12Layer = new FeatureLayer(iFeatureFolder + "29", {id: '29'});
		legendEcology.push({ layer: hvc12Layer, title: 'HVC 1 2' });
		hvc2Layer = new FeatureLayer(iFeatureFolder + "30", {id: '30'});
		legendEcology.push({ layer: hvc2Layer, title: 'HVC 2' });
		hvc3Layer = new FeatureLayer(iFeatureFolder + "31", {id: '31'});
		legendEcology.push({ layer: hvc3Layer, title: 'HVC 3' });
		//climateAndLanduseAllianceLayer = new FeatureLayer(iFeatureFolder + "20", {id: '20'});
		//legendCarbonProject.push({ layer: climateAndLanduseAllianceLayer, title: 'Climate and Landuse Alliance' });
		importantEcoSystemLayer = new FeatureLayer(iFeatureFolder + "33", {id: '33'});
		legendEcology.push({ layer: importantEcoSystemLayer, title: 'Important Ecosystem' });
		bioDiversityTigerTNKSLayer = new FeatureLayer(iFeatureFolder + "34", {id: '34'});
		legendEcology.push({ layer: bioDiversityTigerTNKSLayer, title: 'Bio Diversity Tiger TNKS' });
		console.log("load feature layer - ecology success");
		
		//----- forestry -----
		forestLandStatusLayer = new FeatureLayer(iFeatureFolder + "38", {id: '38'});
		legendForestry.push({ layer: forestLandStatusLayer, title: 'Forestery Land Status' });
		PPIBLayer = new FeatureLayer(iFeatureFolder + "39", {id: '39'});
		legendForestry.push({ layer: PPIBLayer, title: 'PPIB' });
		peatLayer = new FeatureLayer(iFeatureFolder + "40", {id: '40'});
		legendForestry.push({ layer: peatLayer, title: 'Peat' });
		forestConservationLayer = new FeatureLayer(iFeatureFolder + "41", {id: '41'});
		legendForestry.push({ layer: forestConservationLayer, title: 'Forest Conservation' });
		forestManagementUnitLayer = new FeatureLayer(iFeatureFolder + "42", {id: '42'});
		legendForestry.push({ layer: forestManagementUnitLayer, title: 'Forest Management Unit' });
		hphtiLayer = new FeatureLayer(iFeatureFolder + "43", {id: '43'});
		legendForestry.push({ layer: hphtiLayer, title: 'HPHTI' });
		rimbaCorridorLayer = new FeatureLayer(iFeatureFolder + "44", {id: '44'});
		legendForestry.push({ layer: rimbaCorridorLayer, title: 'Rimba Corridor' });
		villageForestLayer = new FeatureLayer(iFeatureFolder + "45", {id: '45'});
		legendForestry.push({ layer: villageForestLayer, title: 'Village Forest' });
		tenurialForestLayer = new FeatureLayer(iFeatureFolder + "46", {id: '46'});
		legendForestry.push({ layer: tenurialForestLayer, title: 'Tenurial Forest' });
		forestryForestCoverLayer = new FeatureLayer(iFeatureFolder + "47", {id: '47'});
		legendForestry.push({ layer: forestryForestCoverLayer, title: 'Forestery Forest Cover' });
		console.log("load feature layer - forestry success");
		
		
		
		//indonesiaLayer, 
		map.addLayers([
			indonesiaBackgroundLayer, 
			mcaiLayer, 	
			provinceLayer, 
			districtLayer, 
				subDistrictMeranginFeatureLayer,
				landscapeLayer,
				
			argoEcologyZoneLayer, cropLandAgricultureLayer, fishingAreaLayer, paddyFieldLayer, sugarCaneLayer, plantationConcessionLayer,
			carbonMeasurementPointLayer, permanentForestPlotsLayer, samplingLocationLayer, npCarbonInitiativeLayer, carbonStockMoFLayer, climateAndLanduseAllianceLayer,
			rainFallsLayer,
			ecologyRegionLayer, tigerDistributionLayer, elephanDistributionLayer, hvc11Layer, hvc12Layer, hvc2Layer, hvc3Layer, importantEcoSystemLayer, bioDiversityTigerTNKSLayer,
			forestLandStatusLayer, PPIBLayer, peatLayer, forestConservationLayer, forestManagementUnitLayer, hphtiLayer, rimbaCorridorLayer, villageForestLayer, tenurialForestLayer, forestryForestCoverLayer, 
		]);
	}
	
	function fSetLegend() {
		map.on('layers-add-result', function () {
		var legend = new Legend({
            map: map,
            layerInfos: legendLayers
          }, "legendDiv");
          legend.startup();
        }); 
		
		map.on('layers-add-result', function () {
		var legendCarbonProject = new Legend({
            map: map,
            layerInfos: legendCarbonProject
          }, "legendCarbonProjectDiv");
          legendCarbonProject.startup();
        });
		
		map.on('layers-add-result', function () {
		var legendClimate = new Legend({
            map: map,
            layerInfos: legendClimate
          }, "legendClimateDiv");
          legendClimate.startup();
        });
		
		map.on('layers-add-result', function () {
		var legendEcology = new Legend({
            map: map,
            layerInfos: legendEcology
          }, "legendEcologyDiv");
          legendEcology.startup();
        });
		
		map.on('layers-add-result', function () {
		var legendForestry = new Legend({
            map: map,
            layerInfos: legendForestry
          }, "legendForestryDiv");
          legendForestry.startup();
        });
	}
	
	function fAddCategoryGroup() {
		//----- agriculture -----
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
            });

            //add the check box and label to the toc
            domConstruct.place(checkBox.domNode, dom.byId("toggle"), "after");
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
		
		
	}
	
	function fHomeButton() {
		hideLayers();
		mcaiLayer.show();
		
		fRadioProvince();
		fRadioProvinceZT();
		
		dijit.byId("provinceSelect").attr("disabled", false);
		dijit.byId("radioProvince").attr("checked", true);
		dijit.byId("provinceSelectZT").attr("disabled", false);
		dijit.byId("radioProvinceZT").attr("checked", true);
	}
		
	function hideLayers() {
		mcaiLayer.hide();
		provinceLayer.setVisibleLayers([]);
		provinceLayer.hide();
		districtLayer.setVisibleLayers([]);
		districtLayer.hide();
		landscapeLayer.setVisibleLayers([]);
		landscapeLayer.hide();		
		
		//argoEcologyZoneLayer.setVisibility();
		fHideAllFeatureLayers();
	}
	
	function fHideAllFeatureLayers() {
		argoEcologyZoneLayer.hide(); cropLandAgricultureLayer.hide(); fishingAreaLayer.hide(); paddyFieldLayer.hide(); sugarCaneLayer.hide(); plantationConcessionLayer.hide();
		carbonMeasurementPointLayer.hide(); permanentForestPlotsLayer.hide(); samplingLocationLayer.hide(); npCarbonInitiativeLayer.hide(); carbonStockMoFLayer.hide(); climateAndLanduseAllianceLayer.hide();
		rainFallsLayer.hide();
		ecologyRegionLayer.hide();  tigerDistributionLayer.hide();  elephanDistributionLayer.hide();  hvc11Layer.hide();  hvc12Layer.hide();  hvc2Layer.hide();  hvc3Layer.hide();  importantEcoSystemLayer.hide();  bioDiversityTigerTNKSLayer.hide(); 		
		forestLandStatusLayer.hide();  PPIBLayer.hide();  peatLayer.hide();  forestConservationLayer.hide();  forestManagementUnitLayer.hide();  hphtiLayer.hide();  rimbaCorridorLayer.hide();  villageForestLayer.hide();  tenurialForestLayer.hide();  forestryForestCoverLayer.hide();  
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
				url:"http://192.168.1.158:6080/arcgis/rest/services/MCA_I/Indonesia_Blank/MapServer"
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
	  