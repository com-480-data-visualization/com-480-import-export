let expandedNodes = [[], [], []];
let selectedItems = [];

function samePath(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function isSelected(path) {
  return selectedItems.some(p => samePath(p, path));
}

function allChildrenSelected(path, node) {
  const kids = getKids(node);
  if (kids.length === 0) return false;
  return kids.every(child => {
    const childPath = [...path, child.id];
    return getKids(child).length > 0
      ? allChildrenSelected(childPath, child)
      : isSelected(childPath);
  });
}

function getSelectedPaths(node = productData, path = []) {
  const kids = getKids(node);
  if (kids.length === 0) return isSelected(path) ? [path] : [];
  if (allChildrenSelected(path, node)) return [path];
  return kids.flatMap(child => getSelectedPaths(child, [...path, child.id]));
}

function getDescendants(node, path = []) {
  const kids = getKids(node);
  if (kids.length === 0) return [path];
  return kids.flatMap(child => getDescendants(child, [...path, child.id]));
}

function findNode(node, path) {
  return path.reduce((curr, id) => curr ? getKids(curr).find(kid => kid.id === id) : null, node);
}

function toggleSelection(path) {
  const node = findNode(productData, path);
  if (!node) return;

  const alreadySelected = selectedItems.some(p => samePath(p, path));

  if (alreadySelected) {
    selectedItems = selectedItems.filter(p => !samePath(p, path));
  } else {
    const descPaths = getDescendants(node, path);
    const hasSelection = descPaths.some(p => selectedItems.some(sel => samePath(sel, p)));

    if (hasSelection) {
      selectedItems = selectedItems.filter(p => !descPaths.some(d => samePath(d, p)));
    } else {
      selectedItems.push(...descPaths.filter(p => !selectedItems.some(sel => samePath(sel, p))));
    }
  }
  renderTree();
}

function getCheckboxState(path, node) {
  if (selectedItems.length === 0) return { checked: false, indeterminate: false };
  if (isSelected(path)) return { checked: true, indeterminate: false };

  const kids = getKids(node);
  if (kids.length === 0) return { checked: false, indeterminate: false };

  let checked = 0, indeterminate = 0;

  for (const child of kids) {
    const state = getCheckboxState([...path, child.id], child);
    if (state.checked) checked++;
    if (state.indeterminate) indeterminate++;
  }

  if (checked === kids.length) return { checked: true, indeterminate: false };
  if (checked > 0 || indeterminate > 0) return { checked: false, indeterminate: true };
  return { checked: false, indeterminate: false };
}

function getKids(node) {
  return node?.tab || node?.tn2 || node?.tn4 || node?.tn || [];
}

function buildTree(data, depth = 0, path = []) {
  const container = document.createElement('div');
  container.style.marginLeft = `${depth * 20}px`;

  data.forEach(item => {
    const currentPath = [...path, item.id];
    const { checked, indeterminate } = getCheckboxState(currentPath, item);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = checked;
    box.indeterminate = indeterminate;
    box.onclick = e => {
      e.stopPropagation();
      toggleSelection(currentPath);
    };
    row.appendChild(box);

    const label = document.createElement('span');
    label.textContent = item.text;
    label.style.marginLeft = '5px';
    row.appendChild(label);

    const kids = getKids(item);
    if (kids.length > 0) {
      row.style.cursor = 'pointer';
      row.style.fontWeight = expandedNodes[depth].includes(item.id) ? 'bold' : 'normal';
      row.onclick = e => {
        e.stopPropagation();
        const isOpen = expandedNodes[depth].includes(item.id);
        expandedNodes[depth] = isOpen
          ? expandedNodes[depth].filter(k => k !== item.id)
          : [...expandedNodes[depth], item.id];
        renderTree();
      };
    }

    container.appendChild(row);

    if (kids.length > 0 && expandedNodes[depth].includes(item.id)) {
      container.appendChild(buildTree(kids, depth + 1, currentPath));
    }
  });

  return container;
}

function renderTree() {
  const root = document.getElementById('product-selector');
  root.innerHTML = '';
  if (productData?.tab) {
    root.appendChild(buildTree(productData.tab));
  }
}

function setupLogButton() {
  document.getElementById('log-selection').onclick = () => {
    getSelectedPaths().forEach(path => console.log(path));
  };
}

function init() {
  renderTree();
  setupLogButton();
}

window.initProductList = init;



let productData = null;
fetch('data/product_compact.json')
  .then(response => response.json())
  .then(json => {
    productData = json;
    console.log('Product JSON loaded successfully:', productData);
    renderTree(); 
  })
  .catch(error => {
    console.error('Error loading Product JSON:', error);
  });


