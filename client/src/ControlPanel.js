import { Box, Typography, TextField, Button, Card, CardContent, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, Divider, Switch, FormControlLabel } from '@mui/material';
import { Add, Delete, GetApp, TableRestaurant, Chair, Bed, Wc, AcUnit } from '@mui/icons-material';
import useStore from './store';

const rotationPresets = [
  { label: '0°', value: 0 },
  { label: '90°', value: Math.PI / 2 },
  { label: '180°', value: Math.PI },
  { label: '270°', value: (3 * Math.PI) / 2 },
];

function ControlPanel() {
  const { container, setContainerDimensions, setContainerMaterial, addElement, removeElement, updateElement, elements, selectedElement, selectElement, materials, colors, exportDesign, snapToGrid, toggleSnapToGrid, gridSize, setGridSize, snapToRotation, toggleSnapToRotation, rotationSnapAngle, setRotationSnapAngle } = useStore();

  const handleAddElement = (type) => {
    let size, position, material, color;
    switch (type) {
      case 'door':
        size = [0.9, 2, 0.1];
        position = [container.length / 2 - 0.05, 1, 0];
        material = 'wood';
        color = '#8B4513';
        break;
      case 'window':
        size = [1, 1, 0.1];
        position = [0, 1.5, container.width / 2 - 0.05];
        material = 'glass';
        color = '#87CEEB';
        break;
      case 'partition':
        size = [0.1, container.height, container.width];
        position = [0, container.height / 2, 0];
        material = 'wood';
        color = '#D2B48C';
        break;
      case 'shelf':
        size = [container.length, 0.1, container.width];
        position = [0, 1, 0];
        material = 'wood';
        color = '#A0522D';
        break;
      case 'table':
        size = [1.5, 0.8, 1];
        position = [0, 0.4, 0];
        material = 'wood';
        color = '#8B4513';
        break;
      case 'chair':
        size = [0.5, 1, 0.5];
        position = [0, 0.5, 0];
        material = 'wood';
        color = '#D2B48C';
        break;
      case 'bed':
        size = [2, 0.5, 1.5];
        position = [0, 0.25, 0];
        material = 'fabric';
        color = '#FFFFFF';
        break;
      case 'toilet':
        size = [0.6, 0.8, 0.6];
        position = [0, 0.4, 0];
        material = 'plastic';
        color = '#FFFFFF';
        break;
      case 'fan':
        size = [0.5, 0.1, 0.5];
        position = [0, 2.5, 0];
        material = 'metal';
        color = '#C0C0C0';
        break;
      default:
        size = [1, 1, 1];
        position = [0, 0, 0];
        material = materials[0];
        color = colors[0];
    }
    addElement({
      type,
      position,
      size,
      material,
      color
    });
  };

  const handleExport = () => {
    const design = exportDesign();
    const blob = new Blob([design], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'container-design.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: 320, p: 2, bgcolor: 'grey.100', height: '100vh', overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>Control Panel</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Container Dimensions</Typography>
          <TextField label="Length" type="number" value={container.length} onChange={(e) => setContainerDimensions({ ...container, length: parseFloat(e.target.value) })} fullWidth margin="normal" />
          <TextField label="Width" type="number" value={container.width} onChange={(e) => setContainerDimensions({ ...container, width: parseFloat(e.target.value) })} fullWidth margin="normal" />
          <TextField label="Height" type="number" value={container.height} onChange={(e) => setContainerDimensions({ ...container, height: parseFloat(e.target.value) })} fullWidth margin="normal" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Snapping & Alignment</Typography>
          <FormControlLabel
            control={<Switch checked={snapToGrid} onChange={toggleSnapToGrid} />}
            label="Snap to Grid"
          />
          <TextField
            label="Grid Size"
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(parseFloat(e.target.value))}
            fullWidth
            margin="normal"
            inputProps={{ min: 0.01, max: 1, step: 0.01 }}
          />
          <FormControlLabel
            control={<Switch checked={snapToRotation} onChange={toggleSnapToRotation} />}
            label="Snap to Rotation"
          />
          <TextField
            label="Rotation Snap Angle"
            type="number"
            value={rotationSnapAngle}
            onChange={(e) => setRotationSnapAngle(parseFloat(e.target.value))}
            fullWidth
            margin="normal"
            inputProps={{ min: 0.1, max: Math.PI, step: 0.1 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Add Elements</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleAddElement('door')}>Door</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleAddElement('window')}>Window</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleAddElement('partition')}>Partition</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleAddElement('shelf')}>Shelf</Button>
            <Button variant="contained" startIcon={<TableRestaurant />} onClick={() => handleAddElement('table')}>Table</Button>
            <Button variant="contained" startIcon={<Chair />} onClick={() => handleAddElement('chair')}>Chair</Button>
            <Button variant="contained" startIcon={<Bed />} onClick={() => handleAddElement('bed')}>Bed</Button>
            <Button variant="contained" startIcon={<Wc />} onClick={() => handleAddElement('toilet')}>Toilet</Button>
            <Button variant="contained" startIcon={<AcUnit />} onClick={() => handleAddElement('fan')}>Fan</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Elements</Typography>
          <List>
            {elements.map(el => (
              <ListItem key={el.id} button onClick={() => selectElement(el.id)} selected={selectedElement === el.id}>
                <ListItemText primary={`${el.type} - ${el.material}`} />
              </ListItem>
            ))}
          </List>
          {selectedElement && <Button variant="outlined" startIcon={<Delete />} onClick={() => removeElement(selectedElement)}>Remove Selected</Button>}
        </CardContent>
      </Card>

      {selectedElement && (() => {
        const el = elements.find(e => e.id === selectedElement);
        return el ? (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Edit Selected Element</Typography>
              <Box>
                <TextField label="Size X" type="number" value={el.size[0]} onChange={(e) => updateElement(selectedElement, { size: [parseFloat(e.target.value), el.size[1], el.size[2]] })} fullWidth margin="normal" />
                <TextField label="Size Y" type="number" value={el.size[1]} onChange={(e) => updateElement(selectedElement, { size: [el.size[0], parseFloat(e.target.value), el.size[2]] })} fullWidth margin="normal" />
                <TextField label="Size Z" type="number" value={el.size[2]} onChange={(e) => updateElement(selectedElement, { size: [el.size[0], el.size[1], parseFloat(e.target.value)] })} fullWidth margin="normal" />
                <TextField label="Position X" type="number" value={el.position[0]} onChange={(e) => updateElement(selectedElement, { position: [parseFloat(e.target.value), el.position[1], el.position[2]] })} fullWidth margin="normal" />
                <TextField label="Position Y" type="number" value={el.position[1]} onChange={(e) => updateElement(selectedElement, { position: [el.position[0], parseFloat(e.target.value), el.position[2]] })} fullWidth margin="normal" />
                <TextField label="Position Z" type="number" value={el.position[2]} onChange={(e) => updateElement(selectedElement, { position: [el.position[0], el.position[1], parseFloat(e.target.value)] })} fullWidth margin="normal" />
                <TextField label="Rotation X" type="number" value={el.rotation[0]} onChange={(e) => updateElement(selectedElement, { rotation: [parseFloat(e.target.value), el.rotation[1], el.rotation[2]] })} fullWidth margin="normal" />
                <TextField label="Rotation Y" type="number" value={el.rotation[1]} onChange={(e) => updateElement(selectedElement, { rotation: [el.rotation[0], parseFloat(e.target.value), el.rotation[2]] })} fullWidth margin="normal" />
                <TextField label="Rotation Z" type="number" value={el.rotation[2]} onChange={(e) => updateElement(selectedElement, { rotation: [el.rotation[0], el.rotation[1], parseFloat(e.target.value)] })} fullWidth margin="normal" />
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Rotation Presets</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {rotationPresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outlined"
                      size="small"
                      onClick={() => updateElement(selectedElement, { rotation: [0, preset.value, 0] })}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Box>
                <FormControlLabel
                  control={<Switch checked={snapToRotation} onChange={toggleSnapToRotation} />}
                  label="Snap to Rotation"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Material</InputLabel>
                  <Select value={el.material} onChange={(e) => updateElement(selectedElement, { material: e.target.value })}>
                    {materials.map(mat => <MenuItem key={mat} value={mat}>{mat}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Color</InputLabel>
                  <Select value={el.color} onChange={(e) => updateElement(selectedElement, { color: e.target.value })}>
                    {colors.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                  </Select>
                </FormControl>
                {el.type === 'door' && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const newIsOpen = !el.isOpen;
                      const newRotation = newIsOpen ? [0, Math.PI / 2, 0] : [0, 0, 0];
                      updateElement(selectedElement, { isOpen: newIsOpen, rotation: newRotation });
                    }}
                  >
                    {el.isOpen ? 'Close Door' : 'Open Door'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ) : null;
      })()}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Container Material</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Material</InputLabel>
            <Select value={container.material} onChange={(e) => setContainerMaterial(e.target.value)}>
              {materials.map(mat => <MenuItem key={mat} value={mat}>{mat}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Color</InputLabel>
            <Select value={colors[0]}>
              {colors.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Button variant="contained" startIcon={<GetApp />} onClick={handleExport} fullWidth>Export Design</Button>
    </Box>
  );
}

export default ControlPanel;
