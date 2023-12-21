'use strict';

import EllipseShape from './Shapes/EllipseShape';
import RectangleShape from './Shapes/RectangleShape';
import RhombShape from './Shapes/RhombShape';

import Util from './Util';

import { CreateCommand, ModifyCommand } from './ActionDispatcher';

export default class ElementEditor {
    editor;
    workArea;
    undoRedo;

    shouldCreate;
    selectedElement;
    listOfElements;
    elementLookup;
    nextid;

    constructor(editor, workArea, undoRedo) {
        this.editor = editor;
        this.workArea = workArea;
        this.undoRedo = undoRedo;

        this.shouldCreate = false;
        this.selectedElement = null;
        this.shouldAddElement = false;
        this.listOfElements = [];
        this.elementLookup = new Map;
        this.nextid = 0;
    }

    selectcreate(datashape) {
        switch (datashape) {
            case 'rect':
                this.selectedElement = new RectangleShape({ width: '100', height: '50' });
                break;
            case 'roundrect':
                this.selectedElement = new RectangleShape({ width: '100', height: '60', rx: '15' });
                break;
            case 'rhomb':
                this.selectedElement = new RhombShape({ width: '100', height: '100' });
                break;
            case 'circle':
                this.selectedElement = new EllipseShape({ width: '100', height: '100' });
                break;
            case 'ellipse':
                this.selectedElement = new EllipseShape({ width: '100', height: '60' });
                break;
            default:
                break;
        }

        const guiGroup = Util.makeSVGElement('g');
        guiGroup.setAttribute('class', 'gui');
        const svgShape = this.selectedElement.getCorropspondingShape();
        svgShape.setAttribute('stroke', '#000000');
        svgShape.setAttribute('fill', 'none');
        const eleid = 'fce_' + this.nextid;
        this.nextid++;
        this.elementLookup.set(eleid, this.listOfElements.length);
        this.listOfElements.push(svgShape);
        guiGroup.appendChild(svgShape);
        this.workArea.appendChild(guiGroup);
        this.shouldCreate = true;
    }

    mainpulationupdate(pos) {
        if (!this.selectedElement) {
            return;
        }
        const currentCommand = this.editor.getCurrentCommand();

        if (currentCommand == 'create' ||
            currentCommand == 'move') {
            const shape = this.selectedElement.getCorropspondingShape().parentNode;
            shape.setAttribute('transform', 'translate(' + pos.x + ', ' + pos.y + ')');

            if (this.shouldCreate) {
                this.shouldCreate = false;
                this.undoRedo.addHistory(new CreateCommand(this.selectedElement, this.workArea));
            } else {
                this.undoRedo.addHistory(new ModifyCommand(this.selectedElement, this.selectedElement.attributes));
            }
        }
    }

    mainpulationdone() {
        if (!this.selectedElement) {
            return;
        }
        // Make resize borders if there are none
        const svgGroup = this.selectedElement.getCorropspondingShape().parentNode;
        if (!svgGroup.querySelector('.resize-handle')) {
            // Make selection borders and corners
            const handles = this.selectedElement.getResizeHandles();

            for (let i = 0; i < handles.length; i++) {
                const border = Util.makeSVGElement('line');
                border.setAttribute('class', 'resize-handle edge');
                border.setAttribute('x1', handles[i].x);
                border.setAttribute('y1', handles[i].y);
                border.setAttribute('x2', handles[(i + 1) % handles.length].x);
                border.setAttribute('y2', handles[(i + 1) % handles.length].y);
                svgGroup.appendChild(border);
            }

            for (let i = 0; i < handles.length; i++) {
                const corner = Util.makeSVGElement('circle');
                corner.setAttribute('class', 'resize-handle corner');
                corner.setAttribute('cx', handles[i].x);
                corner.setAttribute('cy', handles[i].y);
                corner.setAttribute('r', '5');
                svgGroup.appendChild(corner);
            }
        }
    }
}