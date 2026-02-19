window.addEventListener("DOMContentLoaded", (event) => {
const groupTemplate = document.querySelector(".template > *");
const itemTemplate = groupTemplate.querySelector(".group_item.is-item");
const pageMain = document.querySelector(".page_main");
const variableSelectField = document.querySelectorAll(".select_field");
let globalVariables = [];
let componentRoot;
let styleString;
let componentVars = [];
let variableNames = [];
let firstLoad = true;


function extractCSSVariables() {
    const regex = /(--[\w-]+):\s*([^;]+);/g;
    let match;
    while ((match = regex.exec(styleString)) !== null) {
        componentVars.push({ varName: match[1], varValue: match[2].trim() + ";" });
    }
}

async function setStyle() {
    await componentRoot.setTextContent(styleString);
}

function getFieldValue(field, rem = true) {
    let fieldValue = field.value === "" ? 0 : Number(field.value);
    if (rem) fieldValue = fieldValue / 16;
    return fieldValue;
  }
  
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
  
  function scrollToElement(element) {
    const rect = element.getBoundingClientRect();
    const offset =
      rect.top +
      window.pageYOffset -
      document.querySelector(".group_item.is-header").clientHeight;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }

  function closeAllItems() {
    document.querySelectorAll(".group_item").forEach(function (element) {
        element.classList.remove("is-open");
    });
}

function createGroup(item) {
        const groupDiv = groupTemplate.cloneNode(true);
        const groupList = groupDiv.querySelector(".group_list");
        groupList.innerHTML = "";
        pageMain.appendChild(groupDiv);
    
        const fieldMinWidth = groupDiv.querySelector("[data-field='min-width'] input");
        const fieldMaxWidth = groupDiv.querySelector("[data-field='max-width'] input");
        if (item.length === 0) {
          fieldMinWidth.value = 320;
          fieldMaxWidth.value = 1440;
        } else {
          fieldMinWidth.value = item[0].contentMin ?? 320;
          fieldMaxWidth.value = item[0].contentMax ?? 1440;
        }
    
        screenFieldCheck(fieldMinWidth, fieldMaxWidth);
    
        if (item.length === 0 && firstLoad === true) {
            item.push({variableName: "--variable"});
        }

        item.forEach(function (subitem) {
          createItem(subitem, groupList);
        });

        return groupDiv;
  }
  
  /* don't let input values go below 0 */
  document.addEventListener("input", function (e) {
    if (e.target.matches("input[type='number']")) {
      if (e.target.value < 0) e.target.value = 0;
    }
  });
  
  /* increment by 10 when pressing shift */
  document.addEventListener("keydown", (event) => {
    if (event.shiftKey) {
      const inputs = document.querySelectorAll(
        "[data-field='min-width'] input, [data-field='max-width'] input, [data-field='min-size'] input, [data-field='max-size'] input"
      );
      inputs.forEach((input) => input.setAttribute("step", "10"));
    }
  });
  
  document.addEventListener("keyup", (event) => {
    if (!event.shiftKey) {
      const inputs = document.querySelectorAll(
        "input[type='number']"
      );
      inputs.forEach((input) => input.setAttribute("step", "1"));
    }
  });
  
  function extractValuesFromClamp(clampString) {

    const regex =
    /clamp\((-?[\d.]+)rem\s*,\s*(?:calc\()?\s*(-?[\d.]+)rem\s*\+\s*(-?[\d.]+)vw\s*\)?\s*,\s*(-?[\d.]+)rem\)/;  
    const match = clampString.match(regex);
    if (!match) {
      return { contentMin: null, contentMax: null, minSize: null, maxSize: null };
    }
  
    let minSize = parseFloat(match[1]);
    let maxSize = parseFloat(match[4]);
    const rem = parseFloat(match[2]);
    const vw = parseFloat(match[3]);
  
    const slope = vw / 100;
    let contentMin = Math.round(((minSize - rem) / -slope) * -16);
    let contentMax = Math.round(((maxSize - rem) / -slope) * -16);
  
    if (contentMin > contentMax) {
      const tempContentMin = contentMin;
      const tempMinSize = minSize;
      const tempMaxSize = maxSize;
      contentMin = contentMax;
      contentMax = tempContentMin;
      minSize = tempMaxSize;
      maxSize = tempMinSize;
    }
  
    if (isNaN(contentMin)) contentMin = null;
    if (isNaN(contentMax)) contentMax = null;
  
    return {
      contentMin,
      contentMax,
      minSize,
      maxSize,
    };
  }
  
  async function fetchAndLogVariables() {
    await webflow.setExtensionSize("large");

// Get all components
const components = await webflow.getAllComponents();
let componentFound = false;

if (components.length > 0) {
  const componentNames = await Promise.all(components.map(component => component.getName()));
  const foundIndex = componentNames.findIndex(name => name === "Fluid Sizes");
  if (foundIndex !== -1) {
    componentFound = components[foundIndex];
  }
}

if (componentFound === false) {
  const rootElement = await webflow.getRootElement();
  const newElement = await rootElement?.prepend(webflow.elementPresets.DOM);
  newElement.setTag("style");
  newElement.setTextContent(":root {}");
  componentFound = await webflow.registerComponent('Fluid Sizes', newElement);
  await newElement?.remove();
  await rootElement?.prepend(componentFound);
}

componentRoot = await componentFound.getRootElement();


if (componentRoot?.textContent && componentRoot?.children) {
    const children = await componentRoot.getChildren();
    const strings = children.filter((child) => child.type === "String");
    let textContent = [];
    for (const myString of strings) {
      if (myString.type === "String") {
        const text = await myString.getText();
        textContent.push(text);
      }
    }
    styleString = textContent[0];
  }

  extractCSSVariables();

  componentVars.forEach(function (item) {
    let fluidObject = {
        contentMax: null,
        contentMin: null,
        maxSize: null,
        minSize: null,
        variableName: item.varName,
        originalValue: item.varValue,
      };

      const fluidResult = extractValuesFromClamp(item.varValue);
      fluidObject.contentMax = fluidResult.contentMax;
      fluidObject.contentMin = fluidResult.contentMin;
      fluidObject.maxSize = fluidResult.maxSize;
      fluidObject.minSize = fluidResult.minSize;

      let matchFound = false;
       globalVariables.forEach(function (item) {
            if (item[0]?.contentMax === fluidObject.contentMax && item[0]?.contentMin === fluidObject.contentMin) {
              item.push(fluidObject);
              matchFound = true;
            }
        });
        if (!matchFound) globalVariables.push([fluidObject]);
  })


    try {
      const collection = await webflow.getDefaultVariableCollection();
      if (collection) {
        const vars = await collection.getAllVariables();
        // Parallel processing of variables
        const processedVariables = await Promise.all(
          vars.map(async (item) => {
            try {
              const variableById = await collection.getVariable(item.id);
              const variableType = variableById.type;
              let varName = await variableById.getName();
              varName = varName.trim();
              varName = varName.replaceAll(" ", "-");
              varName = varName.replaceAll("/", "--");
              varName = varName.replaceAll(".", "-");
              varName = varName.toLowerCase();
              varName = "--" + varName;
              if (variableType === "Size") {
                variableNames.push(varName)
              }
            } catch (error) {
              console.error(`Error processing variable ID ${item.id}:`, error);
              return null;
            }
          })
        );
      }
    } catch (error) {
      console.error("Error fetching variables:", error);
    }


  }
  
  function createItem(subitem, groupListItem, applyByDefault = false) {
    let groupList = groupListItem;
    const groupItem = itemTemplate.cloneNode(true);
    const nameField = groupItem.querySelector("[data-field='variable-name'] input");
    nameField.value = subitem.variableName;
    const minSizeField = groupItem.querySelector("[data-field='min-size'] input");
    if (subitem.minSize === undefined) subitem.minSize = 2;
    if (subitem.maxSize === undefined) subitem.maxSize = 4;
    minSizeField.value = subitem.minSize * 16;
    const maxSizeField = groupItem.querySelector("[data-field='max-size'] input");
    maxSizeField.value = subitem.maxSize * 16;

    const itemMinScreen = groupItem.querySelector("[data-field='item-min-screen'] input");
    const itemMaxScreen = groupItem.querySelector("[data-field='item-max-screen'] input");

    screenFieldCheck(itemMinScreen, itemMaxScreen);

    groupList.appendChild(groupItem);

    // MENU
    const menuWrap = groupItem.querySelector(".group_menu_wrap");
    const menuButton = groupItem.querySelector(".group_menu_button");
    menuButton.addEventListener("click", function () {
        if (groupItem.classList.contains("is-open")) {
            groupItem.classList.remove("is-open");
        } else {
            closeAllItems();
            groupItem.classList.add("is-open");
        }
    });

    const minBg = groupItem.querySelector("[data-field='min-size'] .group_field_background");
    const maxBg = groupItem.querySelector("[data-field='max-size'] .group_field_background");
  
    if (applyByDefault) {
        scrollToElement(groupItem);
    }
  
    let contentMin;
    let contentMax;
    let minSize;
    let maxSize;
    let clampString = subitem.originalValue;
    let variableName = subitem.variableName;
  
    const debouncedVarSet = debounce(() => {
      // subitem.variable.set({ unit: "rem", value: maxSize });
    }, 200);

    const deleteButton = groupItem.querySelector(".group_action_wrap");
    deleteButton.addEventListener("click", function () {
        styleString = styleString.replace(`${variableName}: ${clampString}`, "");
        setStyle();
        groupItem.remove();
    });
  
    minSizeField.closest(".group_wrap").querySelector("[data-field='min-width'] input");
  
    function getFluidSize(applyValue = true) {
      const parentGroup = minSizeField.closest(".group_wrap");
      const minWidthField = parentGroup.querySelector("[data-field='min-width'] input");
      const maxWidthField = parentGroup.querySelector("[data-field='max-width'] input");
  
      contentMin = getFieldValue(minWidthField, false) / 16;
      contentMax = getFieldValue(maxWidthField, false) / 16;
      minSize = getFieldValue(minSizeField);
      maxSize = getFieldValue(maxSizeField);

      itemMinScreen.value = contentMin * 16;
      itemMaxScreen.value = contentMax * 16;
  
      let rem = (contentMin * maxSize - contentMax * minSize) / (contentMin - contentMax);
      rem = parseFloat(rem);
      let vw = ((maxSize - minSize) / (contentMax - contentMin)) * 100;
      vw = parseFloat(vw);

      let prevCSS = `${variableName}: ${clampString}`;
  
      let accessible = false;
      if (maxSize <= 2.5 * minSize) accessible = true;
      let zooms = false;
      if (rem > 0) zooms = true;
      clampString = `clamp(${minSize}rem, ${rem}rem + ${vw}vw, ${maxSize}rem);`;
      if (minSize > maxSize)
        clampString = `clamp(${maxSize}rem, ${rem}rem + ${vw}vw, ${minSize}rem);`;

      variableName = nameField.value;

      let newCSS = `${variableName}: ${clampString}`;
  
      groupItem.classList.remove("is-error");
      groupItem.classList.remove("is-warning");
      if (!accessible) {
        groupItem.classList.add("is-error");
      } else if (!zooms) {
        groupItem.classList.add("is-warning");
      }
  
      minBg.style.width = `${minSize * 16}px`;
      maxBg.style.width = `${maxSize * 16}px`;
  
      if (applyValue) {

        if (styleString.includes(prevCSS)) {
            styleString = styleString.replace(prevCSS, newCSS);
        } else {
            let insertText = newCSS;
            let index = styleString.lastIndexOf("}");
            if (index !== -1) {
                styleString = styleString.slice(0, index) + insertText + styleString.slice(index);
            }
        }
        setStyle();

        // debouncedVarSet();
      }
    }
    getFluidSize(applyByDefault);

    function moveItem() {
        const itemMax = parseFloat(itemMaxScreen.value);
        const itemMin = parseFloat(itemMinScreen.value)
        let tempGroupList = false;
        document.querySelectorAll(".group_wrap").forEach(function (group) {
            const groupMax = parseFloat(group.querySelector("[data-field='max-width'] input").value);
            const groupMin = parseFloat(group.querySelector("[data-field='min-width'] input").value);
            if (groupMax === itemMax && groupMin === itemMin) tempGroupList = group.querySelector(".group_list");
        });
        closeAllItems();
        let prevList = groupList;
        if (tempGroupList === false) {
            const groupDiv = createGroup([]);
            groupDiv.querySelector("[data-field='max-width'] input").value = itemMax;
            groupDiv.querySelector("[data-field='min-width'] input").value = itemMin;
            groupList = groupDiv.querySelector(".group_list");
        } else {
            groupList = tempGroupList;
        }
        groupList.appendChild(groupItem);
        scrollToElement(groupItem);

        if (prevList.children.length === 0) prevList.closest('.group_wrap').remove();

        getFluidSize();
    }
    itemMinScreen.addEventListener("change", function () {
        moveItem();
    });
    itemMaxScreen.addEventListener("change", function () {
        moveItem();
    });
  
    let fields = [minSizeField, maxSizeField];
    fields.forEach(function (thisField) {
      thisField.addEventListener("change", function () {
        getFluidSize();
      });
    });
  
    nameField.addEventListener("change", function () {
        let nameFieldValue = nameField.value.toLowerCase().trim();
        if (!nameFieldValue.startsWith("--")) nameFieldValue = "--" + nameFieldValue.replace(/^[-_]*/, "");
        nameFieldValue = nameFieldValue.replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
        nameField.value = nameFieldValue;
        getFluidSize();
    });

    document.addEventListener("change", function (event) {
      const parentGroup = minSizeField.closest(".group_wrap");
      if (event.target === parentGroup?.querySelector("[data-field='min-width'] input") || event.target === parentGroup?.querySelector("[data-field='max-width'] input")) {
        getFluidSize();
      }
    });
  }

  function screenFieldCheck(fieldMinWidth, fieldMaxWidth) {
    [fieldMinWidth, fieldMaxWidth].forEach(function (field) {
        field.addEventListener("change", function () {
          if (+fieldMaxWidth.value <= +fieldMinWidth.value)
            fieldMaxWidth.value = +fieldMinWidth.value + 1;
        });
      });
  }

  function createAnOption(name, select) {
    const newOption = document.createElement("option");
    newOption.value = name;
    newOption.text = name;
    newOption.optionFunction = function () {
      createItem({variableName: name}, document.querySelector(".group_list"), true);
    };
    select.add(newOption);
  }
  
  function appCode() {
    if (globalVariables.length === 0) globalVariables.push([]);
    globalVariables.forEach(function (item) {
        createGroup(item)
        firstLoad = false;
    });
  
    variableSelectField.forEach(function (select) {
      variableNames.forEach(function (name) {
        createAnOption(name, select);
      });
      if (!variableNames.length) {
        createAnOption("--variable-name", select);
      }
  
      select.addEventListener("change", function () {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption.optionFunction) selectedOption.optionFunction();
        select.selectedIndex = 0;
      });
    });
  }
  
  async function runAfterFetch() {
    try {
      await fetchAndLogVariables();
      document.querySelector(".page_wrap").classList.remove("loading");
      appCode();
    } catch (error) {
      console.error("Error during fetchAndLogVariables execution:", error);
    }
  }
  
  runAfterFetch();
});