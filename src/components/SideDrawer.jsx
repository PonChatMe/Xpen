import React, { useState } from 'react';
import { Drawer, Tabs, Select, Button, Stack, Text, Title } from '@mantine/core';
import { IconChartPie, IconChartLine, IconChartBar, IconChartArea } from '@tabler/icons-react';

export default function SideDrawer({ opened, onClose }) {
  const [defaultCurrency, setDefaultCurrency] = useState('THB');
  const [chartType, setChartType] = useState('pie');

  const chartTypes = [
    { value: 'pie', label: 'Pie Chart', icon: IconChartPie, video: 'PieChart.mp4' },
    { value: 'line', label: 'Line Chart', icon: IconChartLine, video: 'LineChart.mp4' },
    { value: 'column', label: 'Column Chart', icon: IconChartBar, video: 'Chart.mp4' },
    { value: 'bar', label: 'Bar Chart', icon: IconChartArea, video: 'BarChart.mp4' },
  ];

  const savePrefs = async () => {
    try {
      // Save currency preference
      console.log('Saving preferences:', { defaultCurrency });
      // Here you would typically save to your database or context
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Settings"
      size="md"
      position="left"
      className="bg-gray-900 text-white"
      styles={{
        header: { backgroundColor: '#111827', borderBottom: '1px solid #374151' },
        body: { backgroundColor: '#111827' },
        title: { color: '#f9fafb' }
      }}
    >
      <Tabs defaultValue="settings" className="text-white">
        <Tabs.List className="bg-gray-800 border-gray-700">
          <Tabs.Tab value="settings" className="text-white hover:bg-gray-700 data-[active]:bg-blue-600">
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="habit" className="text-white hover:bg-gray-700 data-[active]:bg-blue-600">
            See Your Habit
          </Tabs.Tab>
          <Tabs.Tab value="quickadd" className="text-white hover:bg-gray-700 data-[active]:bg-blue-600">
            Adjust Quick Add
          </Tabs.Tab>
          <Tabs.Tab value="transactions" className="text-white hover:bg-gray-700 data-[active]:bg-blue-600">
            All Transactions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="settings" pt="md">
          <Stack gap="md">
            <div>
              <Text size="lg" className="text-white font-semibold mb-3">Default Currency</Text>
              <Select
                value={defaultCurrency}
                onChange={setDefaultCurrency}
                data={[
                  { value: 'THB', label: 'Thai Baht (฿)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'GBP', label: 'British Pound (£)' },
                  { value: 'JPY', label: 'Japanese Yen (¥)' },
                ]}
                className="bg-gray-800 border-gray-700"
                styles={{
                  input: { backgroundColor: '#374151', borderColor: '#4b5563', color: '#f9fafb' },
                  dropdown: { backgroundColor: '#374151', borderColor: '#4b5563' },
                  item: { color: '#f9fafb', '&[data-selected]': { backgroundColor: '#3b82f6' } }
                }}
              />
            </div>

            <div>
              <Text size="lg" className="text-white font-semibold mb-3">Theme</Text>
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <Text size="sm" className="text-gray-300">Dark Mode (Always On)</Text>
                <Text size="xs" className="text-gray-400 mt-1">Application is configured for dark theme only</Text>
              </div>
            </div>

            <Button
              onClick={savePrefs}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Preferences
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="habit" pt="md">
          <Stack gap="md">
            <Text size="lg" className="text-white font-semibold">Chart Types</Text>
            <div className="grid grid-cols-2 gap-3">
              {chartTypes.map((chart) => (
                <div
                  key={chart.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    chartType === chart.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                  onClick={() => setChartType(chart.value)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <chart.icon size={24} className="text-gray-300" />
                    <Text size="sm" className="text-gray-300 text-center">
                      {chart.label}
                    </Text>
                    <video
                      src={`${import.meta.env.BASE_URL}IconAssetXpen/${chart.video}`}
                      className="w-full h-20 object-cover rounded"
                      muted
                      loop
                      autoPlay
                    />
                  </div>
                </div>
              ))}
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="quickadd" pt="md">
          <Stack gap="md">
            <Title order={3} className="text-white">Quick Add Configuration</Title>
            <Text size="sm" className="text-gray-300">
              Configure your expense types, categories, and subcategories for the Quick Add section.
            </Text>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <Text size="sm" className="text-gray-400">
                This feature will allow you to customize the Quick Add workflow.
              </Text>
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="transactions" pt="md">
          <Stack gap="md">
            <Title order={3} className="text-white">All Transactions</Title>
            <Text size="sm" className="text-gray-300">
              View and manage all your financial transactions with advanced filtering options.
            </Text>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <Text size="sm" className="text-gray-400">
                Transaction history, filtering, and export functionality will be available here.
              </Text>
            </div>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Drawer>
  );
}
