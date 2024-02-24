
import { h } from '@stencil/core';


export interface IChangeData {
    attributeKey: string;
    value: string; // TODO: value(s)?
}

export interface IChangeHandler {
    (changeData_: IChangeData)
}

export interface IControlListOption {
    isSelected?: boolean;
    label: string;
    value: string;
}

export interface IKeyPressHandler {
    (key_: string)
}

export const listOptionsToHTML = (options_: IControlListOption[], selectedValue_?: string): any[] => {

    if (!options_) { return null; }

    return options_.map((option_: IControlListOption) => {
        if (option_) {

            const label = !option_.label ? "" : option_.label;
            const value = !option_.value ? "" : option_.value;

            let isSelected = false;
            if (typeof(selectedValue_) !== "undefined" && selectedValue_ !== null) {
                if (selectedValue_ === value) { isSelected = true; }
            } else if (option_.isSelected === true) {
                isSelected = true;
            }

            return <option value={value} selected={isSelected}>{label}</option>;
        }
    })
}