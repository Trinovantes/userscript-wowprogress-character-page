declare global {
    interface SubmitEvent extends Event {
        submitter: HTMLElement
    }
}

export {}
