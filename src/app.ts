// Project Type
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project state management
// Singleton
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      // Copy of this.projects
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable): boolean {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length != 0;
  }

  if (
    validatableInput.minLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length > validatableInput.minLength;
  }

  if (
    validatableInput.maxLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length < validatableInput.maxLength;
  }

  if (validatableInput.min && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value > validatableInput.min;
  }

  if (validatableInput.max && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value < validatableInput.max;
  }
  return isValid;
}

// Autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = method.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}
// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T; // HTMLDivElement
  element: U; // HTMLFormElement | HTMLElement

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    // Retrieve template element
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    // Retrieve insert location
    this.hostElement = document.getElementById(hostElementId)! as T;

    // Perform deep clone of template.content element
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // Retrieve "main" element
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    // Render section to dom
    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectList
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
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

  // Function is called upon addition (new projects)
  public renderProjects() {
    // Retrieve the ul element
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    listEl.innerHTML = "";
    // Loop through existing projects and add it to ul
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem)!;
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

// Project Input
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  // This will run upon instantiation
  constructor() {
    super("project-input", "app", true, "user-input");

    // Retrieve title, name and people element
    this.titleInputElement = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      validate(titleValidatable) &&
      validate(descriptionValidatable) &&
      validate(peopleValidatable)
    ) {
      return [enteredTitle, enteredDescription, +enteredPeople];
    } else {
      alert("Please enter the correct format!");
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.peopleInputElement.value = "";
    this.descriptionInputElement.value = "";
  }

  @autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;

      // Add project
      projectState.addProject(title, description, people);

      this.clearInputs();
    }
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
