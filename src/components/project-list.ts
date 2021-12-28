/// <reference path="base-component.ts"/>
/// <reference path="project-item.ts"/>

namespace App {
  // ProjectList
  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignedProjects: Project[];

    // This will run upon instantiation
    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);

      // initialState
      this.assignedProjects = [];

      // Adds a listener which gets called whenever a prj is added
      this.configure();

      // Render list to dom
      this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault(); // prevent default of not allowing dropping
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.add("droppable");
      }
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.remove("droppable");
    }

    @autobind
    dropHandler(event: DragEvent): void {
      const prjId = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(
        prjId,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
      this.dragLeaveHandler(event);
    }

    // Function is called upon addition (new projects)
    public renderProjects() {
      // Retrieve the ul element
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;

      listEl.innerHTML = "";
      // Loop through existing projects and add it to ul
      for (const prjItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
      }
    }

    public renderContent() {
      const listId = `${this.type}-projects-list`;
      // Add id to ul element
      this.element.querySelector("ul")!.id = listId;
      // Add textContent to h2 element
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }

    public configure(): void {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      projectState.addListener((projects: Project[]) => {
        // Filter relevant projects
        const relevantProjects = projects.filter((prj) => {
          if (this.type === "active") {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });

        // Assigns to list
        this.assignedProjects = relevantProjects;
        // Render the list
        this.renderProjects();
      });
    }
  }
}
