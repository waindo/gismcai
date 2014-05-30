var app = {}, map, toc, dynaLayer1, dynaLayer2, featLayer1;
var legendAgriculture = [], legendCarbonProject = [], legendClimate = [], legendEcology = [], legendEnergy = [];
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
		var iMapServicesFolder = "http://localhost:6080/arcgis/rest/services/mcai/";
		var iFeatureFolder = iMapServicesFolder + "Indonesia/MapServer/";
		
		indonesiaBackgroundLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {});
		indonesiaLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {});
		mcaiLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {});		
		provinceLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {});
		districtLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {});
		
		subDistrictMeranginFeatureLayer = new FeatureLayer(iMapServicesFolder + "Indonesia/MapServer/100", {
			mode: FeatureLayer.MODE_SNAPSHOT,
			opacity: 0,
			outFields: ["*"]
		});
		
		//landscapeLayer = new ArcGISDynamicMapServiceLayer(iMapServicesFolder + "Indonesia/MapServer", {
		landscapeLayer = new ArcGISDynamicMapServiceLayer("http://117.54.11.70:6080/arcgis/rest/services/mcai/Modeldemo_Landscape_analysis/MapServer", {
		});
		
		//add for category analysis layers
		//----- agriculture group -----
		sugarcaneLayer = new FeatureLayer(iFeatureFolder + "16", {});
		legendAgriculture.push({ layer: sugarcaneLayer, title: 'Sugarcane' });
		plantationLayer = new FeatureLayer(iFeatureFolder + "15", {});
		legendAgriculture.push({ layer: plantationLayer, title: 'Plantation' });
		paddyFieldLayer = new FeatureLayer(iFeatureFolder + "14", {});
		legendAgriculture.push({ layer: paddyFieldLayer, title: 'Paddy Field' });
		fishingLayer = new FeatureLayer(iFeatureFolder + "13", {});
		legendAgriculture.push({ layer: fishingLayer, title: 'Fishing' });
		ecologyLayer = new FeatureLayer(iFeatureFolder + "12", {});
		legendAgriculture.push({ layer: ecologyLayer, title: 'Ecology' });
		cropLandLayer = new FeatureLayer(iFeatureFolder + "11", {});
		legendAgriculture.push({ layer: cropLandLayer, title: 'Cropland' });
		
		map.addLayers([
			indonesiaBackgroundLayer, 
			mcaiLayer, 	
			provinceLayer, 
			districtLayer, 
				subDistrictMeranginFeatureLayer,
				landscapeLayer,
				
			//agriculture group layers
			cropLandLayer, ecologyLayer, fishingLayer, paddyFieldLayer, plantationLayer, sugarcaneLayer, 
		]);
		
		console.log("load service layer success");
	}
	
	function fSetLegend() {
		map.on('layers-add-result', function () {
		var legendGeneral = new Legend({
            map: map,
            layerInfos: legendLayers
          }, "legendDiv");
          legendGeneral.startup();
        });
		
		map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: legendAgriculture
          }, "legendAgricultureDiv");
          legenda.startup();
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
            domConstruct.place(checkBox.domNode, dom.byId("toggleGeneral"), "after");
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
		//agriculture group layers
			cropLandLayer, ecologyLayer, fishingLayer, paddyFieldLayer, plantationLayer, sugarcaneLayer
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
	  