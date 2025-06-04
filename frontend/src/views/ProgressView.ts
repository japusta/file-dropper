import { IProgressView } from './IProgressView';

/**
 * ProgressView конкретная реализация через два элемента: контейнер и полоса
 */
export class ProgressView implements IProgressView {
  constructor(
    private container: HTMLElement,
    private bar: HTMLElement
  ) {}

  show(): void {
    this.container.hidden = false;
    this.bar.style.width = '0%';
  }

  hide(): void {
    this.container.hidden = true;
  }

  setPercent(pct: number): void {
    this.bar.style.width = `${pct}%`;
  }
}
