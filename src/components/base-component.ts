namespace App {
  // Component Base Class
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
}
