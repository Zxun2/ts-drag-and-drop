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

// ProjectList
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  // This will run upon instantiation
  constructor(private type: "active" | "finished") {
    // Retrieve template element
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;

    // Retrieve insert location
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // Perform deep clone of template.content element
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // Retrieve section element
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    // Render section to dom
    this.attach();

    // Render list to dom
    this.renderContent();
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    // Add id to ul element
    this.element.querySelector("ul")!.id = listId;
    // Add textContent to h2 element
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

// Project Input
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  // This will run upon instantiation
  constructor() {
    // Retrieve template element
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;

    // Retrieve insert location
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // Perform deep clone of template.content element
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    // Retrieve form element
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

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
    // Render
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

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
      console.log(title, description, people);

      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
