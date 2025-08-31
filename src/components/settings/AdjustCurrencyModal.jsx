import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Group, Stack, Text, TextInput, Badge, ActionIcon, Grid, Col } from '@mantine/core';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { IconPlus, IconX } from '@tabler/icons-react';

export default function AdjustCurrencyModal({
  isOpen,
  onClose,
}) {
  const { userProfile, updateUserProfile } = useAuth();
  const [newCustomCurrency, setNewCustomCurrency] = useState('');
  const [localCustomCurrencies, setLocalCustomCurrencies] = useState([]);

  // Initialize local state when modal opens or userProfile changes
  useEffect(() => {
    if (isOpen && userProfile) {
      setLocalCustomCurrencies(userProfile.customCurrencies || []);
    }
  }, [isOpen, userProfile]);

  const allAvailableCurrencies = useMemo(() => {
    return localCustomCurrencies;
  }, [localCustomCurrencies]);

  const handleAddCustomCurrency = () => {
    const currencyCode = newCustomCurrency.trim().toUpperCase();
    if (currencyCode && !localCustomCurrencies.includes(currencyCode)) {
      setLocalCustomCurrencies(prev => [...prev, currencyCode]);
      setNewCustomCurrency('');
    }
  };

  const handleRemoveCustomCurrency = (currencyCode) => {
    setLocalCustomCurrencies(prev => prev.filter(c => c !== currencyCode));
  };

  const handleConfirm = async () => {
    await updateUserProfile({ customCurrencies: localCustomCurrencies });
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Adjust Currencies"
      overlayProps={{ backgroundOpacity: 0.5, blur: 3 }}
      centered
      styles={{
        content: { backgroundColor: '#1a1b1e', color: '#f9fafb' },
        header: { backgroundColor: '#1a1b1e', borderBottom: '1px solid #4b5563' },
        title: { color: '#f9fafb', fontSize: '20px', fontWeight: 'bold' },
        close: { color: '#f9fafb' },
      }}
    >
      <Stack spacing="md">
        <Text size="sm" color="dimmed">Manage your custom currencies.</Text>

        {/* Custom Currencies */}
        <Stack spacing="xs">
          <Text size="md" weight={500} color="#f9fafb">Your Custom Currencies</Text>
          <Grid gutter="xs">
            {localCustomCurrencies.length === 0 && (
              <Col span={12}>
                <Text size="sm" color="dimmed">No custom currencies added yet.</Text>
              </Col>
            )}
            {localCustomCurrencies.map(cc => (
              <Col span={6} key={cc}>
                <Badge
                  color="blue"
                  variant="filled"
                  size="lg"
                  onClick={() => handleRemoveCustomCurrency(cc)}
                  className="flex items-center justify-between w-full"
                  style={{ cursor: 'pointer' }}
                >
                  {cc} <IconX size={12} />
                </Badge>
              </Col>
            ))}
          </Grid>
          <TextInput
            placeholder="Add new custom currency (e.g., BTC)"
            value={newCustomCurrency}
            onChange={(event) => setNewCustomCurrency(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAddCustomCurrency();
              }
            }}
            rightSection={
              <ActionIcon onClick={handleAddCustomCurrency} disabled={!newCustomCurrency.trim()}>
                <IconPlus size={18} />
              </ActionIcon>
            }
            styles={{
              input: { backgroundColor: '#374151', borderColor: '#4b5563', color: '#f9fafb' },
              label: { color: '#f9fafb' },
              placeholder: { color: '#a0aec0' },
            }}
          />
        </Stack>

        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose} styles={{ root: { borderColor: '#4b5563', color: '#f9fafb' }, hover: { backgroundColor: '#4b5563' } }}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!userProfile} styles={{ root: { backgroundColor: '#4b5563' }, hover: { backgroundColor: '#5a6a7a' } }}>
            Confirm
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
