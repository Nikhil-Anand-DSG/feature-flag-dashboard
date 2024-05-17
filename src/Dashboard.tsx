import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody, Switch, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControlLabel, FormHelperText, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface FeatureFlag {
    name: string;
    isEnabled: boolean;
}

const Dashboard: React.FC = () => {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [newFlag, setNewFlag] = useState<FeatureFlag>({ name: '', isEnabled: false });
    const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const apiBaseUrl = 'http://localhost:3000/flags';

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const response = await fetch(apiBaseUrl);
            const data = await response.json();
            setFlags(Object.entries(data).map(([name, isEnabled]) => ({
                name,
                isEnabled: isEnabled as boolean // Assert isEnabled as boolean
            })));
        } catch (error) {
            console.error('Error fetching flags:', error);
        }
    };

    const handleCreateFlag = async () => {
        try {
            await fetch(apiBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFlag),
            });
            fetchFlags();
            setOpenDialog(false);
            setNewFlag({ name: '', isEnabled: false }); // Reset newFlag
        } catch (error) {
            console.error('Error creating flag:', error);
        }
    };

    const handleUpdateFlag = async (flagName: string, newIsEnabled: boolean) => {
        try {
            await fetch(`${apiBaseUrl}/${flagName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: newIsEnabled }),
            });
            fetchFlags();
        } catch (error) {
            console.error('Error updating flag:', error);
        }
    };

    const handleDeleteFlag = async (flagName: string) => {
        try {
            await fetch(`${apiBaseUrl}/${flagName}`, { method: 'DELETE' });
            fetchFlags();
        } catch (error) {
            console.error('Error deleting flag:', error);
        }
    };

    const handleDialogOpen = (flag: FeatureFlag | null = null) => {
        if (flag) {
            setEditFlag(flag);
        } else {
            setNewFlag({ name: '', isEnabled: false });
        }
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setEditFlag(null); // Clear edit flag when closing
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>Feature Flag Dashboard</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Enabled</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {flags.map((flag) => (
                            <TableRow key={flag.name}>
                                <TableCell>{flag.name}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={flag.isEnabled}
                                        onChange={(event) => handleUpdateFlag(flag.name, event.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button startIcon={<EditIcon />} onClick={() => handleDialogOpen(flag)}>
                                        Edit
                                    </Button>
                                    <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteFlag(flag.name)} color="error">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
                sx={{ mt: 2 }}
            >
                Create New Flag
            </Button>

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>{editFlag ? 'Edit Flag' : 'Create New Flag'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ m: 1 }}>
                        <TextField
                            label="Flag Name"
                            value={editFlag ? editFlag.name : newFlag.name}
                            onChange={(e) =>
                                editFlag
                                    ? setEditFlag({ ...editFlag, name: e.target.value })
                                    : setNewFlag({ ...newFlag, name: e.target.value })
                            }
                        />
                        <FormHelperText>Enter a unique flag name</FormHelperText>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editFlag ? editFlag.isEnabled : newFlag.isEnabled}
                                onChange={(e) =>
                                    editFlag
                                        ? setEditFlag({ ...editFlag, isEnabled: e.target.checked })
                                        : setNewFlag({ ...newFlag, isEnabled: e.target.checked })
                                }
                            />
                        }
                        label="Enabled"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={editFlag ? () => handleUpdateFlag(editFlag.name, editFlag.isEnabled) : handleCreateFlag}>
                        {editFlag ? 'Save Changes' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;

