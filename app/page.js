'use client';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button, Card, CardContent } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={2}
      bgcolor="#f9f9f9"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          p={4}
          bgcolor="background.paper"
          boxShadow={24}
          borderRadius={2}
          maxWidth="500px"
          mx="auto"
          mt="10%"
        >
          <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={{ bgcolor: '#1976d2', color: '#fff', ':hover': { bgcolor: '#115293' } }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ bgcolor: '#1976d2', color: '#fff', ':hover': { bgcolor: '#115293' }, mb: 2 }}
      >
        Add New Item
      </Button>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        margin="normal"
        sx={{ maxWidth: '800px' }} 
      />
      <Box border="1px solid #333" width="80%" borderRadius={2} overflow="hidden">
        <Box
          width="100%"
          height="100px"
          bgcolor="#1976d2"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2" color="#fff" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}> 
          <Stack spacing={2} p={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Card key={name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f0f0f0', minWidth: '600px' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h5">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" component="div">
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <Box display="flex" gap={1}>
                  <Button variant="contained" onClick={() => addItem(name)} sx={{ bgcolor: '#1976d2', color: '#fff', ':hover': { bgcolor: '#115293' } }}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)} sx={{ bgcolor: '#d32f2f', color: '#fff', ':hover': { bgcolor: '#9a0007' } }}>
                    Remove
                  </Button>
                </Box>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
