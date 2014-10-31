var app = {}, map, toc, dynaLayer1, dynaLayer2, featLayer1;
var legendAgriculture = [], legendCarbonProject = [], legendClimate = [], legendEcology = [], legendEnergy = [];
var legendForestry = [], legendHazardVunerabillity = [], legendHotspot = [], legendHydrology = [];
var legendInfrastructure = [], legendLandcover = [], legendLandDegradation = [], legendMining = [];
var legendPermits = [], legendLanduseSpatialPlan = [], legendSocioEconomic = [], legendSoil = [];
var legendLayers = [], legendTopography = [], legendRainFalls = [], legendAdministrative = [];
var legendLandscape = [], legendPermitAgriculture = [];

var iAlamatLokal = "localhost";
var iMapServicesFolder = "http://" + iAlamatLokal + ":6080/arcgis/rest/services/data/";
var iFeatureFolder = iMapServicesFolder + "indonesia5/MapServer/";

var findTask, findParams;

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
	
	"esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
	"esri/symbols/TextSymbol",
	
	"esri/renderers/ClassBreaksRenderer",
	"esri/renderers/SimpleRenderer",
	
	"esri/geometry/Extent", 
	"esri/toolbars/navigation",
	"esri/tasks/FindTask",
	"esri/tasks/FindParameters",
	
	"esri/dijit/Print", "esri/tasks/PrintTemplate", 
	"esri/request", "esri/config",
		
	"dojo/dom-construct",
	"dojo/dom",      
	"dojo/on",
	"dojo/parser",      
	"dojo/query",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojox/grid/DataGrid",
    "dojo/data/ItemFileReadStore",
	
	"dojo/_base/Color",
	"dojo/store/Memory",
	"dojo/json",
  
	"dojo/text!./data/dtProvince.json",
	
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
			SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, ClassBreaksRenderer, SimpleRenderer, 
			Extent, Navigation, FindTask, FindParameters, Print, PrintTemplate, esriRequest, esriConfig,
		domConstruct, dom, on, parser, query, arrayUtils, connect, DataGrid, ItemFileReadStore, Color, Memory, JSON, 
		dtProvince, 
		CheckBox, ComboBox, RadioButton, Button, HorizontalSlider, 
			AccordionContainer, BorderContainer, ContentPane, 
			TitlePane, MenuBar, PopupMenuBarItem, Menu, MenuItem, DropDownMenu, TabContainer, Toolbar, registry,
		Measurement,
		TOC
	) {
		var navToolbar;
		var findTask, findParams;
		var map, center, zoom;
        var grid, store;
		
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
		
		//dojo.connect(map, "onUpdateStart", fShowLoading);
        //dojo.connect(map, "onUpdateEnd", fHideLoading);
        dojo.connect(map, "onUpdateEnd", fCheckLegendDiv);
		
  
		fLoadAllLayers();        
		fHideAllFeatureLayers();
		fSetLegend();		
		fKosongDiv();
		fAddCategoryGroup();
		
		fLoadWidgets();
		//fSetPrinter();
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
		on(dom.byId("clearSelectionButton"), "click", function () {
			dom.byId("findLayer").value="-----";
			doFind();
        });
		registry.byId("search").on("click", doFind);
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

		  /*
          registry.byId("deactivate").on("click", function () {
            navToolbar.deactivate();
          });
		  */
		
		//create find task with url to map service
		findTask = new FindTask(iFeatureFolder);
        		
		map.on("load", function () {
			//console.log( map.getLayer(12).visible);
			//if (map.getLayer(12).visible) {
				var iLayerIDActive, iLayerFieldActive
				
				//Create the find parameters
				findParams = new FindParameters();
				findParams.returnGeometry = true;
				findParams.layerIds = [11];
				findParams.searchFields = ["DESA"];
				findParams.outSpatialReference = map.spatialReference;
				//console.log("find sr: ", findParams.outSpatialReference);
			//}			
        });
		
	//------------------------
	//-- all functions --
	//------------------------
	function doFind() {
          //Set the search text to the value in the box
          findParams.searchText = dom.byId("findLayer").value;
          findTask.execute(findParams, showResults); 
	}
	
	function showResults(results) {
          //This function works with an array of FindResult that the task returns
          map.graphics.clear();
          var symbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID, 
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([98, 194, 204]), 2), 
            new Color([98, 194, 204, 0.5])
          );

          //create array of attributes
          var items = arrayUtils.map(results, function (result) {
            var graphic = result.feature;
            graphic.setSymbol(symbol);
            map.graphics.add(graphic);
            return result.feature.attributes;
          });

          //Create data object to be used in store
          var data = {
            identifier : "DESA", //This field needs to have unique values
            label : "DESA", //Name field for display. Not pertinent to a grid but may be used elsewhere.
            items : items
          };

          //Create data store and bind to grid.
          store = new ItemFileReadStore({
            data : data
          });
          var grid = registry.byId("grid");
          grid.setStore(store);
          grid.on("rowclick", onRowClickHandler);

          //Zoom back to the initial map extent
          map.centerAndZoom(center, zoom);
	}
	
	//Zoom to the parcel when the user clicks a row
	function onRowClickHandler(evt) {
	  var clickedTaxLotId = evt.grid.getItem(evt.rowIndex).DESA;
	  var selectedTaxLot = arrayUtils.filter(map.graphics.graphics, function (graphic) {
		return ((graphic.attributes) && graphic.attributes.DESA === clickedTaxLotId);
	  });
	  if ( selectedTaxLot.length ) {
		map.setExtent(selectedTaxLot[0].geometry.getExtent(), true);
	  }
	}
		
	//----- only for fix/reusable code/function -----
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
	function fCreateSlider(iLayerIDStart, iLayerIDEnd, iSliderDivName) {
		slider = new HorizontalSlider({
		name: "slider" + iLayerIDStart,
		value: 1,
		minimum: 0,
		maximum: 1,
		intermediateChanges: true,
		style: "250px",
		onChange: function(value){
				for (var i = iLayerIDStart; i <= iLayerIDEnd; i++) {
					try {
						map.getLayer(i).setOpacity(value);
					}
					catch (e) {
					}
				}			
			}
		}, iSliderDivName);
	}
	function fCreateLabelLayers(iLabelField, iIdField, iLayerURL ) {
	    var labelField = iLabelField;

	    // create a renderer for the capital layer to override default symbology
	    var capitalColor = new esri.Color("#666");
	    var capitalLine = new SimpleLineSymbol("solid", capitalColor, 1.5);
	    var capitalSymbol = new SimpleFillSymbol("solid", capitalLine, null);
	    var capitalRenderer = new SimpleRenderer(capitalSymbol);
	    // create a feature layer to show country boundaries
	    var capitalUrl = iLayerURL;
	    capitalLayer = new FeatureLayer(capitalUrl, {
		    id: iIdField,
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
	function fCreateLegend(iLegendName, iLegendDiv) {
        map.on('layers-add-result', function () {
		var legenda = new Legend({
            map: map,
            layerInfos: iLegendName
          }, iLegendDiv);
          legenda.startup();
        });
    }
	function fCreateCategoryGroup(iLegendName, iToggleName) {
		try {
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
		catch (e) {
		}
		
    }
    function fHideLegendDiv(iLegendName, iLegendDiv) {
        var iAktif=false;
		//console.log(layer.layer.id);
		arrayUtils.forEach(iLegendName, function (layer) {
		if (map.getLayer(layer.layer.id).visible) {iAktif=true}});
		if (!iAktif) {dom.byId(iLegendDiv).innerHTML="";};
		
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//----- change dynamic code/function here -----	
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
				"<td valign=top width=74><font face=Arial size=2>SHAPE AREA</font></td>" +
				"<td><font face=Arial size=2>: ${Shape_Area}</font></td>" +
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
		indonesiaBackgroundLayer = new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer", {id:'5'}); 
		
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
		lyr11 = new FeatureLayer(iFeatureFolder + "11", {id:"11",mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplateDetail,outFields: ["*"]});
		legendAdministrative.push({ layer: lyr11, title: 'Village Boundary'});		
		lyr10 = new FeatureLayer(iFeatureFolder + "10", {id:"10", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters,  infoTemplate: infoTemplate, outFields: ["*"] });
		legendAdministrative.push({ layer: lyr10, title: 'Sub District Boundary'});
		lyr9 = new FeatureLayer(iFeatureFolder + "9", {id:"9", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters,  infoTemplate: infoTemplate, outFields: ["*"] });
		legendAdministrative.push({ layer: lyr9, title: 'District Boundary'});		
		lyr8 = new FeatureLayer(iFeatureFolder + "8", {id:"8"});
		legendAdministrative.push({ layer: lyr8, title: 'Capital Sub District'});		
		lyr7 = new FeatureLayer(iFeatureFolder + "7", {id:"7", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate, outFields: ["*"] });
		legendAdministrative.push({ layer: lyr7, title: 'Capital District'});
				
		//----- climate -----
		lyr15 = new FeatureLayer(iFeatureFolder + "15", {id:"15", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendClimate.push({ layer: lyr15, title: 'Rain Falls'});
		
		//----- energy -----
		lyr20 = new FeatureLayer(iFeatureFolder + "20", {id:"20", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr20, title: 'Transmission Line'});
		lyr19 = new FeatureLayer(iFeatureFolder + "19", {id:"19", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr19, title: 'RE Photovoltaic'});
		lyr18 = new FeatureLayer(iFeatureFolder + "18", {id:"18", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr18, title: 'RE Microhydro'});
		lyr17 = new FeatureLayer(iFeatureFolder + "17", {id:"17", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendEnergy.push({ layer: lyr17, title: 'Power Plants'});
		
		
		//----- forestry -----
		lyr23 = new FeatureLayer(iFeatureFolder + "23", {id:"23", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr23, title: 'Existing Forest Cover'});
		lyr22 = new FeatureLayer(iFeatureFolder + "22", {id:"22", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendForestry.push({ layer: lyr22, title: 'Forest Status'});
		
		//----- hydrology -----
		lyr33 = new FeatureLayer(iFeatureFolder + "33", {id:"33", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr33, title: 'Watershed Boundary'});
		lyr32 = new FeatureLayer(iFeatureFolder + "32", {id:"32", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr32, title: 'Mamuju'});
		lyr31 = new FeatureLayer(iFeatureFolder + "31", {id:"31", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr31, title: 'Mamasa'});
		lyr30 = new FeatureLayer(iFeatureFolder + "30", {id:"30", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendHydrology.push({ layer: lyr30, title: 'Main River'});
		
		//----- Infrastructure -----
		lyr37 = new FeatureLayer(iFeatureFolder + "37", {id:"37", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr37, title: 'Other Road'});
		lyr36 = new FeatureLayer(iFeatureFolder + "36", {id:"36", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendInfrastructure.push({ layer: lyr36, title: 'Main Road'});
		lyr35 = new FeatureLayer(iFeatureFolder + "35", {id:"35", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		//legendInfrastructure.push({ layer: lyr35, title: 'Transportation'});
		
		//----- Landcover -----
		lyr43 = new FeatureLayer(iFeatureFolder + "43", {id:"43", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr43, title: 'Polewali Mandar'});
		lyr42 = new FeatureLayer(iFeatureFolder + "42", {id:"42", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr42, title: 'Mamuju Utara'});
		lyr41 = new FeatureLayer(iFeatureFolder + "41", {id:"41", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr41, title: 'Mamuju'});
		lyr40 = new FeatureLayer(iFeatureFolder + "40", {id:"40", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr40, title: 'Mamasa'});
		lyr39 = new FeatureLayer(iFeatureFolder + "39", {id:"39", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendLandcover.push({ layer: lyr39, title: 'Majene'});
		
		//----- landscape -----
		lyr47 = new FeatureLayer(iFeatureFolder + "47", {id:"47", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,outFields: ["*"]});
		legendLandscape.push({ layer: lyr47, title: 'Mambi Bambang'});
		lyr46 = new FeatureLayer(iFeatureFolder + "46", {id:"46", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,outFields: ["*"]});
		legendLandscape.push({ layer: lyr46, title: 'Sumarorong Pana'});
		lyr45 = new FeatureLayer(iFeatureFolder + "45", {id:"45", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,outFields: ["*"]});
		legendLandscape.push({ layer: lyr45, title: 'Bonehau Kalumpang'});
			
		//----- soil -----
		lyr62 = new FeatureLayer(iFeatureFolder + "62", {id:"62", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr62, title: 'Soil'});
		lyr61 = new FeatureLayer(iFeatureFolder + "61", {id:"61", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendSoil.push({ layer: lyr61, title: 'Fault'});
		
		//----- topography -----
		lyr69 = new FeatureLayer(iFeatureFolder + "69", {id:"69", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr69, title: 'Polewali Mandar'});
		lyr68 = new FeatureLayer(iFeatureFolder + "68", {id:"68", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr68, title: 'Mamuju Utara'});
		lyr67 = new FeatureLayer(iFeatureFolder + "67", {id:"67", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		//legendTopography.push({ layer: lyr67, title: 'Kerinci'});
		lyr66 = new FeatureLayer(iFeatureFolder + "66", {id:"66", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr66, title: 'Mamuju'});
		lyr65 = new FeatureLayer(iFeatureFolder + "65", {id:"65", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr65, title: 'Mamasa'});
		lyr64 = new FeatureLayer(iFeatureFolder + "64", {id:"64", mode: FeatureLayer.MODE_ONDEMAND, imageParameters : imageParameters, infoTemplate: infoTemplate,});
		legendTopography.push({ layer: lyr64, title: 'Majene'});
		
		fCreateLabelLayers("NAMA_KOTA", "CAPITAL", iFeatureFolder + "7");
		
		map.addLayers([
			//----- polygon layers group -----
			indonesiaBackgroundLayer, 
			indonesiaLayer, mcaiGP, mcaiH, mcaiPM,
			
			lyr7, lyr8, lyr9, lyr10, lyr11, 
			
			lyr15, 
			
			lyr17, lyr18, lyr19, lyr20,
			
			lyr22, lyr23, 
			
			//lyr25, lyr26, lyr27, lyr28,  
			
			lyr30, lyr31, lyr32, lyr33,  
			
			lyr35, lyr36, lyr37, 
			
			lyr39, lyr40, lyr41, lyr42, lyr43, 
			
			lyr45, lyr46, lyr47, 
			
			lyr61, lyr62, 
			
			lyr64, lyr65, lyr66, lyr67,  lyr68, lyr69
		]);
		
		
		console.log("load service layer success");
	}
    function fSetLegend() {
        fCreateLegend(legendLayers, "legendDiv");        
		fCreateLegend(legendAdministrative, "legendAdministrativeDiv");
		fCreateLegend(legendClimate, "legendClimateDiv");
        fCreateLegend(legendEnergy, "legendEnergyDiv");
        fCreateLegend(legendForestry, "legendForestryDiv");
        fCreateLegend(legendHydrology, "legendHydrologyDiv");
        fCreateLegend(legendInfrastructure, "legendInfrastructureDiv");
        fCreateLegend(legendLandcover, "legendLandcoverDiv");
        fCreateLegend(legendLandscape, "legendLandscapeDiv");
        fCreateLegend(legendSoil, "legendSoilDiv");
		fCreateLegend(legendTopography, "legendTopographyDiv");
	}	
	function fAddCategoryGroup() {
        fCreateCategoryGroup(legendLayers, "toggleGeneral");	
        fCreateCategoryGroup(legendAdministrative, "toggleAdministrative");
        fCreateCategoryGroup(legendClimate, "toggleClimate");
		fCreateCategoryGroup(legendEnergy, "toggleEnergy");
        fCreateCategoryGroup(legendForestry, "toggleForestry");
        fCreateCategoryGroup(legendHydrology, "toggleHydrology");
        fCreateCategoryGroup(legendInfrastructure, "toggleInfrastructure");
        fCreateCategoryGroup(legendLandcover, "toggleLandcover");
        fCreateCategoryGroup(legendLandscape, "toggleLandscape");
        fCreateCategoryGroup(legendSoil, "toggleSoil");
        fCreateCategoryGroup(legendTopography, "toggleTopography");
	}
	function fCheckLegendDiv() {
        fHideLegendDiv(legendLayers,"legendDiv");
        fHideLegendDiv(legendAdministrative,"legendAdministrativeDiv");
        fHideLegendDiv(legendClimate,"legendClimateDiv");
        fHideLegendDiv(legendEnergy,"legendEnergyDiv");
        fHideLegendDiv(legendForestry,"legendForestryDiv");
        fHideLegendDiv(legendHydrology,"legendHydrologyDiv");
        fHideLegendDiv(legendInfrastructure,"legendInfrastructureDiv");
        fHideLegendDiv(legendLandcover,"legendLandcoverDiv");
        fHideLegendDiv(legendLandscape,"legendLandscapeDiv");
        fHideLegendDiv(legendSoil,"legendSoilDiv");
		fHideLegendDiv(legendTopography,"legendTopographyDiv");
	}
	
	function fAdditionalInfo(iVal) {
		fCheckLegendDiv();
				capitalLayer.hide();
				labelLayer.hide();
			
				if (map.getLayer(7).visible) {					
					capitalLayer.show();
					labelLayer.show();			
					//alert("Edo");
				}
		return;
		
		//alert(iVal);
		var targetLayer = map.getLayer(iVal);        
		var iIsi1 = "<table><tr><td valign='top'>Layer Name</td><td valign='top'>";
		var iIsi2 ="</td></tr><tr><td valign='top'>Description</td><td valign='top'>";
		var iIsi3 ="</td></tr><tr><td valign='top'>Source</td><td valign='top'>";
		var iIsi4 ="</td></tr></table><br>";
		var iKet1 = "", iKet2 = "", iKet3 = "";
		var iHasilPlantation="", iHasilBerbak="", iHasilCarbon="", iHasil ="";
		
			capitalLayer.hide();
			labelLayer.hide();
				
			for (var i = 1; i < 132; i++) {
				//capital district label 
				//district layer
				if (i == "7" && map.getLayer(i).visible) {					
					capitalLayer.show();
					labelLayer.show();			
					//alert("Edo");
				}
				
				//district layer
				if (i == "9" && map.getLayer(i).visible) {			
					iKet1 = "District Boundary";				
					iKet2 = "Polygon showing district boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//subdistrict layer
				if (i == "10" && map.getLayer(i).visible) {			
					iKet1 = "Sub District Boundary";				
					iKet2 = "Polygon showing sub district boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//village layer
				if (i == "11" && map.getLayer(i).visible) {			
					iKet1 = "Village Boundary";				
					iKet2 = "Polygon showing village boundary of Jambi Province.";
					iKet3 = "BPS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				
				//plantation concession layer
				/*
				if (i == "14" && map.getLayer(i).visible) {			
					iKet1 = "Plantation Concession";
					
					iKet2 = "Palm oil plantations polygon in Jambi province, scale 1:250.000. The data contains commodities such as cocoa, rubber, and ";
					iKet2 = iKet2 + "oil palm. Update 2012. Data was verified with tabular data released by the Department of Plantation in Jambi Province. ";
					iKet2 = iKet2 + "PTHI added types of permits, no SK, Description, and SK Date.";
					
					iKet3 = "Disbun & PT. Hatfield Indonesia (PTHI)";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4;
				}
				*/

				//berbak np carbon initiative layer
				if (i == "17" && map.getLayer(i).visible) {
					iKet1 = "Berbak NP Carbon Initiative";					
					iKet2 = "Polygon showing location of carbon project, which is based on MoU between Zoological Society of London (ZSL) Indonesia and  Berbak National Park signed on October 12th 2011.  ";
					iKet2 = iKet2 + "The MoU aims to reduce emission from deforestation and degradation in ";
					iKet2 = iKet2 + "Berbak National Park, which includes 3 year work plan to achieve self-financing, sustainable conservation of the area.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}

				//carbon measurement layer
				if (i == "14" && map.getLayer(i).visible) {
					iKet1 = "Carbon Measurement Points (ZSL)";				
					iKet2 = "Points showing location of carbon measurement in Berbak National Park";					
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//carbon stock layer
				if (i == "18" && map.getLayer(i).visible) {
					iKet1 = "Carbon Stock 2011 (MoF)";
					
					iKet2 = "Carbon stock estimation, which was derived by landcover and carbon value. ";
					iKet2 = iKet2 + "Carbon value calculated based on reference from IPCC. Scale 1:250.000";
					
					iKet3 = "MoF & PTHI";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				/*
				//permanent forest layer
				if (i == "15" && map.getLayer(i).visible) {
					iKet1 = "Permanent Forest Plots (ZSL)";
					iKet2 = "Points showing location of permanent forest plots in Berbak National Park";
					iKet3 = "MoF & PTHI";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				
				//sampling location layer
				if (i == "16" && map.getLayer(i).visible) {
					iKet1 = "Sampling Location (ICRAF)";
					iKet2 = "Carbon measurement sampling for ALREDDI-ICRAF year 2012. ";
					iKet2 = iKet2 + "The map derived from coordinate of sampling location.";
					iKet3 = "ICRAF report & PTHI.";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//rain falls layer
				if (i == "20" && map.getLayer(i).visible) {
					iKet1 = "Rain Falls";
					iKet2 = "Precipitation data in Jambi Province, scale 1:250.000. Based  on landsystem 1987. ";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}

				//tiger distribution layer
				/*
				if (i == "22" && map.getLayer(i).visible) {
					iKet1 = "Tiger Distribution";
					iKet2 = "Polygon showing tiger habitat in Sumatra, based on area  of 250km2 assumption which is the smallest area for tiger to be able to live.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//elephant distribution layer
				if (i == "23" && map.getLayer(i).visible) {
					iKet1 = "Elephant Distribution";
					iKet2 = "Polygon showing elephant distribution in Sumatera. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 1 1 layer
				if (i == "24" && map.getLayer(i).visible) {
					iKet1 = "HCV 1.1 - Wild Plant Sanctuaries (WWF)";
					iKet2 = "Polygon showing wild plant sanctuary area to support biodiversity.  The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 1 2 layer
				if (i == "25" && map.getLayer(i).visible) {
					iKet1 = "HCV 1.2 - Threatened and Endangered Species (WWF)";
					iKet2 = "Polygon showing threatens and endangered species ecosystem. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 2 layer
				if (i == "26" && map.getLayer(i).visible) {
					iKet1 = "HCV 2 – Important Natural Landscapes";
					iKet2 = "Polygon showing natural landscapes, which has capacity to maintain natural ecology processes and dynamics. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//hcv 3 layer
				if (i == "27" && map.getLayer(i).visible) {
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
				if (i == "29" && map.getLayer(i).visible) {
					iKet1 = "Important Ecosystem";
					iKet2 = "Polygon showing Important ecosystem. The map was published in www.savesumatera.org.";
					iKet3 = "WWF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				//transmission line layer
				if (i == "34" && map.getLayer(i).visible) {
					iKet1 = "Transmission Line";
					iKet2 = "Line showing existing transmission line in Jambi.";
					iKet3 = "Bappeda";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest land status layer
				if (i == "36" && map.getLayer(i).visible) {
					iKet1 = "Forest Status";
					iKet2 = "Polygon showing forest function (Protected Forest, Production Forest, Limited Production Forest, etc)";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				/*
				//ppib layer
				if (i == "37" && map.getLayer(i).visible) {
					iKet1 = "Forest Production Moratorium";
					iKet2 = "Polygon showing forest production moratorium in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//forest conservation alliance layer
				if (i == "38" && map.getLayer(i).visible) {
					iKet1 = "Forest Concession Activities";
					iKet2 = "Polygon showing forest conservation activities in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				
				//forest management unit layer
				if (i == "39" && map.getLayer(i).visible) {
					iKet1 = "Forest Management Unit";
					iKet2 = "Polygon showing forest management unit.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//rimba corridor layer
				if (i == "40" && map.getLayer(i).visible) {
					iKet1 = "Rimba Corridor";
					iKet2 = "Polygon showing Rimba Corridor in Sumatera";
					iKet3 = "MCC dataset";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//village forest layer
				if (i == "41" && map.getLayer(i).visible) {
					iKet1 = "Village Forest";
					iKet2 = "Polygon showing village forest management.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//tenurial forest alliance layer
				if (i == "42" && map.getLayer(i).visible) {
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
				
				//hotspot layer
				if (i == "50" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (1999 - 2009)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 1999 - 2009.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "51" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (2010)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 2010.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "52" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution Jambi (2011)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 2011.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				if (i == "53" && map.getLayer(i).visible) {
					iKet1 = "Hotspot Distribution (2012)";
					iKet2 = "Point showing hotspot  location, which indicate forest fire, for period 1999 - 2012.";
					iKet3 = "USGS";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				
				//watershed boundary layer
				if (i == "67" && map.getLayer(i).visible) {
					iKet1 = "Watershed Boundary";
					iKet2 = "Polygon showing watershed boundary based on SK 511/Menhut-V/2011.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//river big layer
				if (i == "55" && map.getLayer(i).visible) {
					iKet1 = "Main River";
					iKet2 = "Polygon showing main river.";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//river small layer
				if (
					(i == "56" && map.getLayer(i).visible) || 
					(i == "57" && map.getLayer(i).visible) || 
					(i == "58" && map.getLayer(i).visible) || 
					(i == "59" && map.getLayer(i).visible) || 
					(i == "60" && map.getLayer(i).visible) || 
					(i == "61" && map.getLayer(i).visible) || 
					(i == "62" && map.getLayer(i).visible) || 
					(i == "63" && map.getLayer(i).visible) || 
					(i == "64" && map.getLayer(i).visible) || 
					(i == "65" && map.getLayer(i).visible) || 
					(i == "66" && map.getLayer(i).visible)
					) {
					iKet1 = "River";
					iKet2 = "Polygon showing smaller river.";
					iKet3 = "BIG";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
							
				//landcover layer
				if (
					(i == "82" && map.getLayer(i).visible) || 
					(i == "83" && map.getLayer(i).visible) || 
					(i == "84" && map.getLayer(i).visible) || 
					(i == "85" && map.getLayer(i).visible) || 
					(i == "86" && map.getLayer(i).visible) || 
					(i == "87" && map.getLayer(i).visible) || 
					(i == "88" && map.getLayer(i).visible) || 
					(i == "89" && map.getLayer(i).visible) || 
					(i == "90" && map.getLayer(i).visible) || 
					(i == "91" && map.getLayer(i).visible) || 
					(i == "92" && map.getLayer(i).visible)
					) {
					iKet1 = "Landcover 2011 (MoF)";
					iKet2 = "Polygon showing landcover in Jambi.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//critical land layer
				if (i == "97" && map.getLayer(i).visible) {
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
				
				//Landuse (Spatial Planning) layer
				if (i == "99" && map.getLayer(i).visible) {
					iKet1 = "Landuse (Spatial Planning)";
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
				
				/*
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
				*/
				
				//forest land swap layer
				if (i == "108" && map.getLayer(i).visible) {
					iKet1 = "Forest Land Swap (IPPKH)";
					iKet2 = "Polygon showing forest temporary use (pinjam pakai) for mining including the name of company and license number.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				/*
				//hgu layer
				if (i == "109" && map.getLayer(i).visible) {
					iKet1 = "Land Cultivation Right (HGU)";
					iKet2 = "Polygon showing plantations permits.";
					iKet3 = "BPN";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				*/
				//iuphhk ha layer
				if (i == "110" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Natural Forest (IUPHHK – HA)";
					iKet2 = "Polygon showing timber concessions in Jambi province. Issued on 2013.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk hti layer
				if (i == "111" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Timber Estate (IUPHHK – HTI)";
					iKet2 = "Polygon showing industrial timber plantation concessions in Jambi province. Issued on 2013.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk htr layer
				if (i == "112" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Community Timber Estate (IUPHHK – HTR)";
					iKet2 = "Polygon showing forest plantation managed by local people.";
					iKet3 = "MoF";
					
					iHasil = iHasil + iIsi1 + iKet1 + iIsi2 + iKet2 + iIsi3 + iKet3 + iIsi4
				}
				
				//iuphhk re layer
				if (i == "113" && map.getLayer(i).visible) {
					iKet1 = "Permit to Utilize Forest Product in Ecological Restoration (IUPHHK – RE)";
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
        fCheckLegendDiv();
	}
		
	function hideLayers() {
		fHideAllFeatureLayers();
	}
	function fKosongDiv() {
		dom.byId("legendDiv").innerHTML="";
		dom.byId("legendAdministrativeDiv").innerHTML="";
		dom.byId("legendCarbonProjectDiv").innerHTML="";
		dom.byId("legendClimateDiv").innerHTML="";
		dom.byId("legendEnergyDiv").innerHTML="";
		dom.byId("legendForestryDiv").innerHTML="";
		dom.byId("legendHydrologyDiv").innerHTML="";
		dom.byId("legendInfrastructureDiv").innerHTML="";
		dom.byId("legendLandcoverDiv").innerHTML="";
		dom.byId("legendLandscapeDiv").innerHTML="";
		dom.byId("legendLandDegradationDiv").innerHTML="";
		dom.byId("legendPermitAgricultureDiv").innerHTML="";
		dom.byId("legendMiningDiv").innerHTML="";
		dom.byId("legendPermitsDiv").innerHTML="";
		dom.byId("legendLanduseSpatialPlanDiv").innerHTML="";
		dom.byId("legendSocioEconomicDiv").innerHTML="";
		dom.byId("legendSoilDiv").innerHTML="";
		dom.byId("legendTopographyDiv").innerHTML="";
	}
	function fHideAllFeatureLayers() {
			mcaiGP.hide(); mcaiH.hide(); mcaiPM.hide();
			
			lyr7.hide();  lyr8.hide();  lyr9.hide();  lyr10.hide();  lyr11.hide();  
			
			lyr15.hide();  
			
			lyr17.hide();  lyr18.hide();  lyr19.hide();  lyr20.hide(); 
			
			lyr22.hide();  lyr23.hide();  
			
			//lyr25.hide();  lyr26.hide();  lyr27.hide();  lyr28.hide();   
			
			lyr30.hide();  lyr31.hide();  lyr32.hide();  lyr33.hide();   
			
			lyr35.hide();  lyr36.hide();  lyr37.hide();  
			
			lyr39.hide();  lyr40.hide();  lyr41.hide();  lyr42.hide();  lyr43.hide();  
			
			lyr45.hide();  lyr46.hide();  lyr47.hide();  
			
			lyr61.hide();  lyr62.hide();  
			
			lyr64.hide();  lyr65.hide();  lyr66.hide();  lyr67.hide();   lyr68.hide();  lyr69.hide();
			
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
		fCreateSlider(7, 11, "sliderAdministrative");
		fCreateSlider(15, 15, "sliderClimate");
		fCreateSlider(17, 20, "sliderEnergy");
		fCreateSlider(22, 23, "sliderForestry");
		fCreateSlider(30, 33, "sliderHydrology");
		fCreateSlider(35, 37, "sliderInfrastructure");
		fCreateSlider(39, 43, "sliderLandcover");
		fCreateSlider(45, 47, "sliderLandscape");
		fCreateSlider(61, 62, "sliderSoil");
		fCreateSlider(64, 69, "sliderTopograpy");
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
				//{name:"Jambi", id:"15"},
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
				{name:"Mamuju", id:"MJ"},
				{name:"Mamuju Utara", id:"MU"},
				{name:"Mejene", id:"ME"},
				{name:"Mamasa", id:"MS"}
			]
		});
		var landscapeStore = new Memory({
			data: [
				{name:"Bonehau Kalupang", id:"BT"},
				{name:"Sumarorong Pana", id:"ST"},
				{name:"Mambi Bambang", id:"SA"}
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
				//{name:"Jambi", id:"15"},
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
				{name:"Sulawesi Barat", id:"76"}
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
				{name:"Mamuju", id:"MJ"},
				{name:"Mamuju Utara", id:"MU"},
				{name:"Majene", id:"ME"},
				{name:"Mamasa", id:"MS"},
				{name:"Polewali Mandar", id:"PM"}
			]
		});
		var landscapeStoreZT = new Memory({
			data: [
				{name:"Bonehau Kalumpang", id:"BT"},
				{name:"Sumarorong Pana", id:"ST"},
				{name:"Mambi Bambang", id:"SA"}
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
			placeHolder: "Select a Province",
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
		fCheckLegendDiv();

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
				case 'Mamuju':
					map.centerAndZoom(esri.geometry.Point([13307686.624445667,-270310.92384258437], 
						new esri.SpatialReference({ wkid: 102100 })),9);
					break;
					
				case 'Mamasa':
					map.centerAndZoom(esri.geometry.Point([13284908.390016677,-333065.72406475135], 
						new esri.SpatialReference({ wkid: 102100 })),10);
					break;
					
				case 'Mamuju Utara':
					map.centerAndZoom(esri.geometry.Point([13325572.889064377,-151374.90783096413], 
						new esri.SpatialReference({ wkid: 102100 })),9);
					break;
					
				case 'Majene':
					map.centerAndZoom(esri.geometry.Point([13250053.105118625,-363640.53537883365], 
						new esri.SpatialReference({ wkid: 102100 })),10);
					break;
					
				case 'Polewali Mandar':
					map.centerAndZoom(esri.geometry.Point([13273595.709830476,-376940.57830043713], 
						new esri.SpatialReference({ wkid: 102100 })),10);
					break;
			}
			
		}
		
		//analisa untuk landscape
		if (iArea == 3) {
			//cek nama landscape
			switch (iSelectArea)
			{
				case 'Bonehau Kalumpang':
					map.centerAndZoom(esri.geometry.Point([13296106.414660493,-281661.82254292985], 
						new esri.SpatialReference({ wkid: 102100 })),11); 
					break;
					
				case 'Sumarorong Pana':
					map.centerAndZoom(esri.geometry.Point([13298514.181051472,-348888.18891965173], 
						new esri.SpatialReference({ wkid: 102100 })),12); 
					break;
				case 'Mambi Bambang':
					map.centerAndZoom(esri.geometry.Point([13276423.879877085,-325957.08043412975], 
						new esri.SpatialReference({ wkid: 102100 })),12); 
					break;
			}			
		}
	}

	//end of scripts
      });
	  