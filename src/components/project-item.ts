/// <reference path="base-component.ts"/>
/// <reference path="../autobind/Autobind.ts"/>
/// <reference path="../models/project-model.ts"/>
/// <reference path="../models/drag-drop-interfaces.ts"/>

namespace App {
  export class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;

    get persons() {
      if (this.project.people === 1) {
        return "1 person";
      } else {
        return `${this.project.people} persons`;
      }
    }

    constructor(hostId: string, project: Project) {
      // Uses the singe-project template, append to hostId,
      // with its own personal project.id
      super("single-project", hostId, false, project.id);
      this.project = project;

      this.configure();
      this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
      // format, data
      event.dataTransfer!.setData("text/plain", this.project.id);
      // controls how the cursor will look like
      event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_: DragEvent): void {}

    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent(): void {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent = this.persons + "assigned";
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }
}
