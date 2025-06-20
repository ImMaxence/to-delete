import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Title, BarChart, Text, Grid, Subtitle, Button, TextInput, Tab, TabList, TabPanel, TabPanels, Tabs } from "@tremor/react";

const API_URL = "https://to-delete-production.up.railway.app/api/sensors";

function TerminalSimulator({ onSend, response, loading }) {
  const [input, setInput] = useState('[\n  { "name": "temperature", "value": 22.5 }\n]');

  return (
    <Card className="mb-6">
      <Title>Simulateur POST /api/sensors</Title>
      <Text>Envoie un payload JSON comme si tu utilisais Postman ou le terminal.</Text>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={6}
        className="mb-2 font-mono"
        placeholder='[ { "name": "temperature", "value": 22.5 } ]'
        style={{ fontFamily: 'monospace', minHeight: 80, width: "100%" }}
      />
      <Button onClick={() => onSend(input)} loading={loading} className="mt-2">Envoyer</Button>
      {response && (
        <Card className="mt-2 bg-gray-100">
          <Text className="font-mono">{response}</Text>
        </Card>
      )}
    </Card>
  );
}

function DataCharts({ data }) {
  // Regroupe par type de mesure
  const types = Array.from(new Set(data.map(d => d.name)));
  return (
    <Grid numItems={types.length > 1 ? 2 : 1} className="gap-6">
      {types.map(type => (
        <Card key={type}>
          <Title>{type}</Title>
          <BarChart
            className="mt-4 h-72"
            data={data.filter(d => d.name === type).map(d => ({ ...d, date: d.createdAt?.slice(0, 19).replace('T', ' ') }))}
            index="date"
            categories={["value"]}
            colors={["blue"]}
            yAxisWidth={40}
          />
        </Card>
      ))}
    </Grid>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [postResp, setPostResp] = useState("");

  useEffect(() => {
    if (tab === 0) {
      axios.get(`${API_URL}/all`).then(res => setData(res.data)).catch(() => setData([]));
    }
  }, [tab]);

  const handleSend = async (json) => {
    setLoading(true);
    setPostResp("");
    try {
      const resp = await axios.post(`${API_URL}`, JSON.parse(json));
      setPostResp(JSON.stringify(resp.data, null, 2));
    } catch (e) {
      setPostResp(e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <Title>Dashboard Capteurs (Sensor Community)</Title>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabList>
          <Tab>Visualisation</Tab>
          <Tab>Simulateur POST</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Subtitle>Données récentes</Subtitle>
            <DataCharts data={data} />
          </TabPanel>
          <TabPanel>
            <TerminalSimulator onSend={handleSend} response={postResp} loading={loading} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
}
