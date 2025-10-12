import { Notice, sanitizeHTMLToDom, setIcon } from "obsidian";

export function showNotice(...message: unknown[]) {
	new Notice(message.join(" "));
	console.log(message);
}

export function showError(error: Error | string) {
	console.error(error);
	if (typeof error === "string")
		new Notice(
			sanitizeHTMLToDom(`<span style="color:var(--text-error)">${error}</span>`)
		);
	else {
		const msg = error.message ? error.message : String(error);
		new Notice(sanitizeHTMLToDom(`<span style="color:var(--text-error)">${msg}</span>`));
	}
}

export class TransferStatusBar {
	statusBarItem: HTMLElement;
	counter: number;
	total: number;
	status: HTMLElement;
	icon: HTMLElement;
	isAttachment?: boolean;

	constructor(statusBarItem: HTMLElement, total: number, isAttachment?: boolean) {
		this.statusBarItem = statusBarItem;
		this.isAttachment = isAttachment;
		this.counter = 0;
		this.total = total;
		this.icon = this.statusBarItem.createSpan({ cls: ["vault-transfer-icon"] });
		setIcon(this.icon, "search-check");
		this.status = this.isAttachment
			? this.statusBarItem.createSpan({
					text: `Number of attachments found to transfer: ${this.total}`,
				})
			: this.statusBarItem.createSpan({
					text: `Number of files to transfer: ${this.total}`,
				});
		this.statusBarItem.addClass("loading");
	}

	increment() {
		this.counter++;
		setIcon(this.icon, "hourglass");
		this.status.setText(`Transfering: ${this.counter}/${this.total}`);
		this.statusBarItem.removeClass("starting");
		this.statusBarItem.addClass("running");
	}

	finish() {
		this.statusBarItem.removeClass("running");
		this.statusBarItem.addClass("finished");
		setIcon(this.icon, "check");
		this.status.setText(
			`Finished transfering ${this.counter} ${this.isAttachment ? "attachments" : "files"}.`
		);
		this.remove();
	}

	error() {
		this.statusBarItem.removeClass("running");
		this.statusBarItem.addClass("error");
		setIcon(this.icon, "cross");
		this.status.setText(`Error during transfer.`);
		this.remove();
	}

	remove() {
		setTimeout(() => {
			this.statusBarItem.remove();
		}, 5000);
	}
}
