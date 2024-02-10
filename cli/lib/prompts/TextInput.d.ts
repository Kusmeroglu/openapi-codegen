import type { FC } from "react";
interface TextInputProps {
    /**
     * Text to display when `value` is empty.
     */
    placeholder?: string;
    /**
     * Listen to user's input. Useful in case there are multiple input components
     * at the same time and input must be "routed" to a specific component.
     */
    focus?: boolean;
    /**
     * Replace all chars and mask the value. Useful for password inputs.
     */
    mask?: string;
    /**
     * Whether to show cursor and allow navigation inside text input with arrow keys.
     */
    showCursor?: boolean;
    /**
     * Highlight pasted text
     */
    highlightPastedText?: boolean;
    /**
     * Value to display in a text input.
     */
    value: string;
    /**
     * Function to call when value updates.
     */
    onChange: (value: string) => void;
    /**
     * Function to call when `Enter` is pressed, where first argument is a value of the input.
     */
    onSubmit?: (value: string) => void;
}
export declare const TextInput: FC<TextInputProps>;
export {};
