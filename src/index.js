const dom = {
  container: document.querySelector('#container'),
};

class WindowManager {
  constructor() {
    this.windows = {};
    
    this.draggingWindow = null;
    this.dragOffset = {
      left: 0,
      top: 0,
    };

    // ugh
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  attach() {
    dom.container.addEventListener('mousedown', this.handleMouseDown);
    dom.container.addEventListener('mousemove', this.handleMouseMove);
    dom.container.addEventListener('mouseup', this.handleMouseUp);
    dom.container.addEventListener('click', this.handleClick);
  }

  detach() {
    dom.container.removeEventListener('mousedown', this.handleMouseDown);
    dom.container.removeEventListener('mousemove', this.handleMouseMove);
    dom.container.removeEventListener('mouseup', this.handleMouseUp);
    dom.container.removeEventListener('click', this.handleClick);
  }

  createWindow(options) {
    const chipWindow = new ChipWindow(options);
    this.windows[chipWindow.id] = chipWindow;
    chipWindow.mount();
    return chipWindow;
  }

  destroyWindow(windowId) {
    const chipWindow = this.windows[windowId];
    chipWindow.unmount();
    delete this.windows[windowId];
  }

  getWindowForDom(element) {
    const root = element.closest('.chip-window');
    return this.windows[root.dataset.windowId];
  }

  handleClick(event) {
    if (event.target.matches('.chip-window .close-window-button')) {
      const chipWindow = this.getWindowForDom(event.target);
      this.destroyWindow(chipWindow.id);
    }
  }

  handleMouseDown(event) {
    if (event.target.matches('.chip-window .title-bar :not(button)')) {
      this.draggingWindow = this.getWindowForDom(event.target);
      const rect = event.target.getBoundingClientRect();
      this.dragOffset.left = event.clientX - rect.left;
      this.dragOffset.top = event.clientY - rect.top;
      return;
    }
  }

  handleMouseMove(event) {
    if (this.draggingWindow) {
      this.draggingWindow.setPosition(
        event.clientX - this.dragOffset.left, 
        event.clientY - this.dragOffset.top,
      );
    }
  }

  handleMouseUp() {
    this.draggingWindow = null;
  }
}

class ChipWindow {
  constructor({
    title,
    width, 
    height, 
    left, 
    top,
  }) {
    this.id = ChipWindow._nextId++;

    this.root = document.createElement('div');
    this.root.classList.add('chip-window');
    this.root.dataset.windowId = this.id;

    this.titleBar = document.createElement('div');
    this.titleBar.classList.add('title-bar');
    this.root.appendChild(this.titleBar);

    this.titleText = document.createElement('div');
    this.titleText.classList.add('title-text');
    this.titleText.textContent = title;
    this.titleBar.appendChild(this.titleText);

    this.closeButton = document.createElement('button');
    this.closeButton.classList.add('close-window-button');
    this.closeButton.textContent = 'X';
    this.titleBar.appendChild(this.closeButton);

    this.setSize(width, height);
    this.setPosition(left, top);
  }

  mount() {
   dom.container.appendChild(this.root); 
  }

  unmount() {
    dom.container.removeChild(this.root);
  }

  setPosition(left, top) {
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
  }

  setSize(width, height) {
    this.root.style.width = `${width}px`;
    this.root.style.height = `${height}px`;
  }
}
ChipWindow._nextId = 0;

const windowManager = new WindowManager(300, 200, 100, 100);
windowManager.attach();
windowManager.createWindow({
  title: 'Test Window',
  width: 300, 
  height: 200, 
  left: 100, 
  top: 100,
});
windowManager.createWindow({
  title: 'Test Window 2',
  width: 200, 
  height: 100, 
  left: 500, 
  top: 200,
});