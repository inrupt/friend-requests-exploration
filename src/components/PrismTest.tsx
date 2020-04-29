import React from 'react';
import { create } from "jss";
import preset from "jss-preset-default";
import { button, createTheme } from "prism-patterns";
import SDKDefault from "prism-theme-sdk-default";

export interface Data {
  text: string;
}

export const PrismTest: React.FC<Data> = data => {
  const jss = create({
    insertionPoint: document.head,
  });
  jss.setup(preset());
  const muiTheme = createTheme(SDKDefault);
  const buttonStyles = button.styles(muiTheme);
  const classes = jss.createStyleSheet(buttonStyles).attach().classes;
  return (
    <>
      <button className={classes.button}>{data.text}</button>
    </>
  );
}