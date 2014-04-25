define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'esri/dijit/Bookmarks',
	'dojo/json',
	'dojo/cookie',
	'dojo/_base/lang'
], function(declare, _WidgetBase, Bookmarks, json, cookie, lang) {

	//anonymous function to load CSS files required for this module
	(function() {
		var css = [require.toUrl("gis/dijit/Bookmarks/css/Bookmarks.css")];
		var head = document.getElementsByTagName("head").item(0),
			link;
		for (var i = 0, il = css.length; i < il; i++) {
			link = document.createElement("link");
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = css[i].toString();
			head.appendChild(link);
		}
	}());

	var bookmarks = [
	{
		extent: {
			xmin: 11162557.862651093,
			ymin: -343049.3829438085, 
			xmax: 11580209.785201093,
			ymax: -152874.05657038168,
			spatialReference: {
				wkid: 102100
			}
		},
		name: "Merangin"
	}
	/*
	{
		extent: {
			xmin: 11324451.488559064,
			ymin: -299658.50789473834,
			xmax: 11379486.148924317,
			ymax: -271720.77405654406,
			spatialReference: {
				wkid: 102100
			}
		},
		name: "Sungai Tenang"
	}*/
	];

	return declare([_WidgetBase], {
		postCreate: function() {
			this.inherited(arguments);

			this.bookmarkItems = cookie("bookmarkItems");
			if (this.bookmarkItems === undefined) {
				this.bookmarkItems = [];
			} else {
				this.bookmarkItems = json.parse(this.bookmarkItems);
			}

			this.bookmarks = new Bookmarks({
				map: this.map,
				editable: this.editable,
				bookmarks: lang.mixin(this.bookmarkItems, bookmarks)
			}, this.domNode);

			this.connect(this.bookmarks, "onEdit", "setBookmarks");
			this.connect(this.bookmarks, "onRemove", "setBookmarks");
		},
		setBookmarks: function() {
			cookie('bookmarkItems', json.stringify(this.bookmarks.toJson()), {
				expires: 365
			});
		},
		_export: function() {
			return json.stringify(this.bookmarks.toJson());
		}
	});
});