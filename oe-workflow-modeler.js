/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "../@polymer/polymer/polymer-element.js";
import "../@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "../@polymer/iron-flex-layout/iron-flex-layout.js";
import { OECommonMixin } from "../oe-mixins/oe-common-mixin.js";
import "../@polymer/font-roboto/roboto.js";
import "../@polymer/iron-collapse/iron-collapse.js";


/**
 * `oe-workflow-modeler`
 *  Polymer 3 component for editing Workflows
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @demo demo/index.html
 */
class OEWorkflowModeler extends OECommonMixin(PolymerElement) {
  static get is() {
    return 'oe-workflow-modeler';
  }

  static get template() {
    return html`
    Hello Workflow
    `
    // <style include="iron-flex iron-flex-alignment iron-flex-factors">
    //   :host{
    //     font-family: 'Roboto';
    //     display:block;
    //     position:relative;
    //   }
    //   .app-body{
    //       height:calc(100vh - 40px);
    //   }
    //   footerEle{
    //     height:40px;
    //   }
     
    //   .full-view{
    //     width:100vw;
    //   }

    //   .expanded-view{
    //     width:75vw;
    //   }

    //   .compressed-view{
    //     width:35vw;
    //   }

    // </style>
    // <div class="app-body layout horizontal">
    //   <oe-component-preview class$="[[_previewClass]]" component="[[workingComponent]]" template-containers="{{containerList}}" meta-data="{{metaData}}"></oe-component-preview>
    //   <iron-collapse horizontal class="flex" opened="[[__showSettings(workingComponent)]]">
    //       <oe-component-editor id="editor" 
    //       component="[[workingComponent]]" 
    //       containers="{{containerList}}" 
    //       template-list=[[templateList]]
    //       on-component-updated="_updateComponent"
    //       meta-data="{{metaData}}"></oe-componenet-editor>
    //   </iron-collapse>
    // </div>
    // <oe-component-footer id="footerEle" 
    // component="[[workingComponent]]"
    // disable-undo=[[_disableUndo(stackIndex)]]
    // disable-redo=[[_disableRedo(stackIndex)]]
    // module=[[_moduleElement]] studio-footer></oe-component-footer>
    //`;
  }

  constructor() {
    super(); //initial values

    this.templateList = [];
    this.componentStack = [];
    this.workingComponent = null;
    this.stackIndex = -1; //footer configuration

    this._previewClass = "full-view";
    this._moduleElement = this;
    this.addEventListener("load-uicomponent", this._loadComponent.bind(this));
    this.addEventListener("show-field-setting", this._showFieldSettings.bind(this));
    this.addEventListener("update-templatelist", this._updateTemplateList.bind(this));
    this.addEventListener("update-preview-class", this._updatePreviewClass.bind(this));

    this.addEventListener("undo-component-change", this.__prevStackIndex.bind(this));
    this.addEventListener("redo-component-change", this.__nextStackIndex.bind(this));
  }

  static get observers() {
    return ["_computeCurentComponent(componentStack,stackIndex)"];
  }

  _updatePreviewClass(ev) {
    this.set('_previewClass', ev.detail);
  }

  _computeCurentComponent(compArr, stack) {
    var comp = null;
    if (compArr && stack >= 0 && compArr[stack]) {
      comp = JSON.parse(JSON.stringify(compArr[stack]));
    }
    this.set("workingComponent", comp);
  }

  _loadComponent(ev) {
    var component = ev.detail;

    if (component) {
      component.container = component.container || {};
      this.componentStack = [component];
      this.set('stackIndex', 0);
      this._previewClass = "expanded-view";
    }
  }

  _showFieldSettings(event) {
    this.$.editor._configField(event.detail);
  }

  _updateTemplateList(event) {
    this.set("templateList", event.detail);
  }

  __showSettings(comp) {
    return !!comp;
  }

  _updateComponent(event) {
    if(this.stackIndex !== this.componentStack.length-1){
      //Clear content after the stackIndex
      this.componentStack.splice(this.stackIndex + 1 , (this.componentStack.length - 1 - this.stackIndex) );
    }
    this.componentStack.push(event.detail);
    this.__nextStackIndex();
  }

  __nextStackIndex() {
    var cur = this.stackIndex;
    if (cur < this.componentStack.length - 1) {
      this.set("stackIndex", cur + 1);
    }
  }

  __prevStackIndex() {
    var cur = this.stackIndex;
    if (cur > 0) {
      this.set("stackIndex", cur - 1);
    }
  }

  _disableUndo(index) {
    return index <= 0;
  }

  _disableRedo(index) {
    return index === (this.componentStack.length - 1);
  }
}

window.customElements.define(OEWorkflowModeler.is, OEWorkflowModeler);
