import GeneratorModule from "@babel/generator"
const generate = GeneratorModule.default
import { parse } from "@babel/parser"
import TraverseModule from "@babel/traverse"
import { isYandexModuleDefinition } from "./transform/yandex-module-definition/helpers/is-yandex-module-definition-statement.helper.js"
import type { IYandexModuleDefinitionStatement } from "./transform/yandex-module-definition/yandex-module-definition.statement.js"
const traverse = TraverseModule.default

const ast = parse(/*javascript*/ `
/**
* @fileOverview
* Class of the balloon.
*/
ym.modules.define(
    'Balloon',
    ['util.defineClass', 'Popup', 'map.action.Single', 'Monitor', 'util.pixelBounds', 'util.math.areEqual', 'vow', 'util.fireWithBeforeEvent', 'balloon.component.getBalloonMode', 'util.scheduler.strategy.Raf', 'util.margin', ym.modules.preload('balloon.metaOptions')],
    function (provide, defineClass, Popup, SingleAction, Monitor, utilPixelBounds, areEqual, vow, fireWithBeforeEvent, getBalloonMode, Raf, utilMargin) {
        /**
         * @class A balloon is a popup window that can display any HTML content.
         * There is usually just one balloon instance on the map and it is managed via special managers
         * (for example, <xref href="map.Balloon.xml">maps</xref>,
         * <xref href="geoObject.Balloon.xml">geo objects</xref>,
         * <xref href="hotspot.layer.Balloon.xml">hotspot layers</xref> and so on).
         * Don't create them yourself, unless truly necessary.
         * @name Balloon
         * @augments Popup
         * @augments IBalloon
         * @param {Map} map Reference to a map object.
         * @param {Object} [options] Options.
         * @param {Boolean} [options.autoPan=true] To move the map to show the opened balloon.
         * @param {Number} [options.autoPanDuration=500] The duration of the movement to the point of the balloon (in milliseconds).
         * @param {Number|Number[]} [options.autoPanMargin=34] Offset or offsets from the edges of the visible map area when executing autoPan.
         * The value can be set as a single number (equal margins on all sides),
         * as two numbers (for vertical and horizontal margins),
         * or as four numbers (in the order of upper, right, lower, and left margins).
         * Keep in mind that this value will be added to the value calculated in the margins manager {@link map.margin.Manager}.
         * @param {Boolean} [options.autoPanCheckZoomRange=false] Enables autoscaling when it is impossible to display the map after dragging on the same scale.
         * @param {Boolean} [options.autoPanUseMapMargin=true] Whether to account for map margins {@link map.margin.Manager} when executing autoPan.
         * @param {Boolean} [options.closeButton=true] Flag for the Close button.
         * @param {Boolean} [options.shadow=true] Flag for whether there is a shadow.
         * @param {Function|String} [options.layout=islands#balloon] External layout for the balloon. (Type: constructor for an object with the {@link ILayout} interface or the layout key).
         * @param {Function|String} [options.contentLayout] Layout for balloon content. (Type: constructor for an object with the {@link ILayout} interface or the layout key).
         * @param {Function|String} [options.panelContentLayout=null] The layout of the balloon contents in the panel mode.
         * If this option is omitted, the value of the contentLayout option is used. (Type: constructor for an object with the {@link ILayout} interface or the layout key).
         * @param {Function|String} [options.shadowLayout] Layout for the shadow. (Type: constructor for an object with the {@link ILayout} interface or the layout key).
         * @param {Number[]} [options.offset] Additional position offset relative to the anchor point.
         * @param {Number[]} [options.shadowOffset] Additional position offset of the shadow relative to the anchor point.
         * @param {Number} [options.minWidth] Minimum width, in pixels.
         * @param {Number} [options.minHeight] Minimum height, in pixels.
         * @param {Number} [options.maxWidth] Maximum width, in pixels.
         * @param {Number} [options.maxHeight] Maximum height, in pixels.
         * @param {Number} [options.panelMaxMapArea] The maximum area of the map at which the balloon will be displayed in the panel mode.
         * You can disable panel mode by setting the value to <i>0</i>, and vice versa, you can always show the balloon in panel mode by setting the value to <i>Infinity</i>.
         * @param {Number} [options.panelMaxHeightRatio] The maximum height of the balloon panel. Defined as the coefficient relative to the map height: a number from 0 to 1.
         * @param {String} [options.pane='balloon'] Key of the pane that the balloon overlay is placed in.
         * @param {String} [options.zIndex] The z-index of the balloon.
         * @borrows Popup.params:options.openTimeout as this.params
         * @borrows Popup.params:options.closeTimeout as this.params
         * @borrows Popup.params:options.interactivityModel as this.params
         *
         * @example
         * // Creating an independent balloon instance and displaying it in the center of the map.
         * var balloon = new ymaps.Balloon(myMap);
         * // Here map options are set to parent options,
         * // where they contain default values for mandatory options.
         * balloon.options.setParent(myMap.options);
         * // Opening a balloon at the center of the map:
         * balloon.open(myMap.getCenter());
             */
        function Balloon(map, options) {
            Balloon.superclass.constructor.call(this, map, options)
            this.options.setName('balloon')
        }
        defineClass(Balloon, Popup, /** @lends Balloon.prototype */{
            open: function (position, data) {
                this.options.set('panelMode', this._isPanelNeeded())
                var wasOpen = this.isOpen(),
                    promiseOpen = Balloon.superclass.open.call(this, position, data)

                // TODO может возникнуть ошибка - если каким-нибудь образом в
                // одном тике вызвать несколько открытий и закрытий.
                // Здесь тоже наверное нужно будет использовать cancelableCallback.
                return promiseOpen.then(function (openingResult) {
                    // Workaround for #MAPSAPI-9914
                    var promiseLayout = this.getOverlaySync().getLayout()
                    return promiseLayout.then(function () {
                        this._shape = this.getOverlaySync().getShape()
                        if (!wasOpen) {
                            this._setupListeners()
                        }
                        if (this._isPanelNeeded() && this.options.get('autoPan')) {
                            this._moveMapCenter()
                        } else if (this.options.get('autoPan')) {
                            this.autoPan()
                        }
                        return openingResult
                    }, this)
                }, this)
            },
            close: function (force) {
                var result = Balloon.superclass.close.call(this, force)
                result.then(function () {
                    this._clearListeners()
                    this._shape = null
                }, this)
                return result
            },
            setPosition: function (position) {
                this._positionAtZoom = this._map.getZoom()
                return Balloon.superclass.setPosition.call(this, position)
            },
            autoPan: function () {
                if (this._isPanelNeeded()) {
                    return this.options.get('autoPan') ? this._moveMapCenter() : vow.reject()
                }
                var overlay = this.getOverlaySync(),
                    map = this.getMap()
                if (!this.isOpen() || !map || !overlay) {
                    return vow.reject()
                }
                var shape = this._shape
                if (!shape || this.getOverlaySync().getPane().getOverflow() == 'visible') {
                    return vow.reject()
                }
                if (!this.isOpen()) {
                    return vow.reject()
                }
                var deferred = vow.defer(),
                    currentState = map.action.getCurrentState(),
                    actionScaleFactor = Math.pow(2, currentState.zoom - map.getZoom()),
                    shapeBounds = (actionScaleFactor == 1 ? shape : shape.scale(actionScaleFactor)).getBounds(),
                    containerSize = this._map.container.getSize(),
                    autoPanMargin = this.options.get('autoPanMargin'),
                    margin = this.options.get('autoPanUseMapMargin', true) ? utilMargin.sum([autoPanMargin, this._map.margin.getMargin()]) : autoPanMargin,
                    halfWidth = containerSize[0] / 2,
                    halfHeight = containerSize[1] / 2,
                    viewport = [[currentState.globalPixelCenter[0] - halfWidth, currentState.globalPixelCenter[1] - halfHeight], [currentState.globalPixelCenter[0] + halfWidth, currentState.globalPixelCenter[1] + halfHeight]],
                    offset = utilPixelBounds.fit(shapeBounds, viewport, margin)
                if (offset) {
                    map.action.stop()
                    var globalPixelCenter = map.getGlobalPixelCenter(),
                        action = new SingleAction({
                            globalPixelCenter: [globalPixelCenter[0] - offset[0], globalPixelCenter[1] - offset[1]],
                            zoom: map.getZoom(),
                            duration: this.options.get('autoPanDuration', 500),
                            timingFunction: 'ease-in-out',
                            checkZoomRange: this.options.get('autoPanCheckZoomRange', false)
                        }, map)
                    this.events.fire('autopanbegin')
                    map.events.once('actionend', function () {
                        this.events.fire('autopanend')
                        deferred.resolve()
                    }, this)
                    map.action.execute(action)
                } else {
                    deferred.resolve()
                }
                return deferred.promise()
            },
            _setupListeners: function () {
                this._mapListeners = this.getMap().events.group().add('boundschange', this._onMapBoundsChange, this).add('sizechange', this._applyPanelMode, this)
                this._overlayListeners = this.getOverlaySync().events.group().add('shapechange', this._onShapeChange, this).add('userclose', this._onUserClose, this)
                this._panelMaxMapAreaMonitor = new Monitor(this.options).add('panelMaxMapArea', this._applyPanelMode, this)
            },
            _clearListeners: function () {
                if (this._panelMaxMapAreaMonitor) {
                    this._panelMaxMapAreaMonitor.destroy()
                }
                if (this._overlayListeners) {
                    this._overlayListeners.removeAll()
                }
                if (this._mapListeners) {
                    this._mapListeners.removeAll()
                }
            },
            _onMapBoundsChange: function () {
                if (this.isOpen()) {
                    this._preventAutoPanOnZoomChange = true
                    this.setupGeometry()
                    this._preventAutoPanOnZoomChange = false
                }
            },
            _applyPanelMode: function () {
                var panelMode = this._isPanelNeeded()
                this.options.set('panelMode', panelMode)
                if (panelMode && this.options.get('autoPan')) {
                    // fix MAPSAPI-9914
                    // TODO как-то неимоверно тут все сложно стало.
                    // Кажется, что в режиме панели margin карты должен самим Balloon'ом
                    // устанавливаться до кидания события "open" в случае открытия
                    // А здесь должен дожидаться получения шейпа,
                    // а уже потом вызывать this._moveMapCenter.
                    if (this.getOverlaySync().getLayoutSync()) {
                        // Нужно дать открытой панели возможность изменить свою высоту.
                        new Raf(this._moveMapCenter, this).start()
                    } else {
                        this.getOverlaySync().getLayout().then(this._moveMapCenter, this)
                    }
                }
            },
            _onShapeChange: function () {
                if (!this.isOpen() || this._isPanelNeeded()) {
                    return
                }
                var shape = this.getOverlaySync().getShape()
                if (shape && this._shape) {
                    var newBounds = shape.getBounds(),
                        oldBounds = this._shape.getBounds()
                    if (areEqual(oldBounds[0], newBounds[0]) && areEqual(oldBounds[1], newBounds[1])) {
                        return
                    }
                }
                this._shape = shape
                if (this.options.get('autoPan') && !this._preventAutoPanOnZoomChange) {
                    this.autoPan()
                }
            },
            _moveMapCenter: function () {
                var map = this.getMap(),
                    overlay = this.getOverlaySync()
                if (!this.isOpen() || !map || !overlay) {
                    // TODO нужно передавать ошибку
                    return vow.reject()
                }
                var deferred = vow.defer(),
                    pixels = overlay.getGeometry().getCoordinates(),
                    useMapMargin = this.options.get('autoPanUseMapMargin', true)
                if (!areEqual(pixels, map.getGlobalPixelCenter({
                    useMapMargin: useMapMargin
                }))) {
                    var currentActionZoom = map.action.getCurrentState().zoom,
                        positionAtZoom = this._positionAtZoom
                    if (Math.abs(currentActionZoom - positionAtZoom) > 1e-7) {
                        var ratio = Math.pow(2, currentActionZoom - positionAtZoom)
                        pixels = [pixels[0] * ratio, pixels[1] * ratio]
                    }
                    deferred.resolve(map.setGlobalPixelCenter(pixels, currentActionZoom, {
                        useMapMargin: useMapMargin,
                        duration: 300
                    }))
                } else {
                    deferred.resolve()
                }
                return deferred.promise()
            },
            _onUserClose: function () {
                fireWithBeforeEvent(this.events, {
                    type: 'userclose',
                    target: this
                }, {
                    context: this,
                    successCallback: this._onBeforeUserCloseSuccess
                })
            },
            _onBeforeUserCloseSuccess: function (originalEvent) {
                this.close()
                this.events.fire(originalEvent.type, originalEvent)
            },
            _isPanelNeeded: function () {
                return getBalloonMode(this.getMap(), this.options.get('panelMaxMapArea')) == 'panel'
            }
        })
        provide(Balloon)
    }
)
`)

const definitions = new Array<IYandexModuleDefinitionStatement>()
const transformStrategy: "merge" | "divide" = "divide"

traverse(ast, {
    Statement: (path) => {
        if (isYandexModuleDefinition(path.node)) definitions.push(path.node)
        if (path.parent) debugger
    }
})

console.log(generate(ast))