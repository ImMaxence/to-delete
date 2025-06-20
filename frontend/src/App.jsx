import React, { useEffect, useState } from "react";
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  Title,
  BarChart,
  LineChart,
  Text,
  Metric,
  Flex,
  Divider,
  Grid,
  Button,
  TextInput,
  Subtitle,
  Callout
} from "@tremor/react";
import axios from "axios";

const API_BASE = "https://to-delete-production.up.railway.app/api/sensors";

const SENSOR_COLORS = {
  temperature: "indigo",
  humidity: "cyan",
  pressure: "orange",
  noise: "rose",
  noise_LAeq: "rose",
  noise_LA_min: "rose",
  noise_LA_max: "rose",
  P1: "amber",
  P2: "yellow",
  latitude: "green",
  longitude: "green",
  altitude: "green"
};

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

function formatTimestamp(ts) {
  if (!ts) return "-";
  const d = new Date(isNaN(ts) ? ts : Number(ts) * (ts > 1e12 ? 1 : 1000));
  // Format JJ/MM HH:mm:ss
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

import SensorLineChart from "./SensorLineChart";

function SensorCharts({ data }) {
  const grouped = groupBy(data, "name");
  return (
    <Grid numItems={2} className="gap-6">
      {Object.entries(grouped).map(([name, values]) => {
        const points = values.map(d => {
          let ts = d.timestamp;
          if (!ts || ts === "0") ts = d.createdAt;
          return {
            x: formatTimestamp(ts),
            rawDate: new Date(isNaN(ts) ? ts : Number(ts) * (ts > 1e12 ? 1 : 1000)),
            value: parseFloat(d.value)
          };
        })
        .filter(pt => !isNaN(pt.value) && pt.x !== "-")
        .sort((a, b) => a.rawDate - b.rawDate);
        return (
          <Card key={name} className="bg-slate-100">
            <Title>{name}</Title>
            {points.length > 0 ? (
              <SensorLineChart label={name} data={points} />
            ) : (
              <Text className="text-center text-slate-400 mt-12">Aucune donnée exploitable pour le graphe</Text>
            )}
          </Card>
        );
      })}
    </Grid>
  );
}

function DataSummary({ data }) {
  const grouped = groupBy(data, "name");
  return (
    <Grid numItems={3} className="gap-4">
      {Object.entries(grouped).map(([name, values]) => {
        const avg = values.length > 0 ? (values.reduce((sum, v) => sum + (parseFloat(v.value) || 0), 0) / values.length).toFixed(2) : "-";
        return (
          <Card key={name}>
            <Subtitle>{name}</Subtitle>
            <Metric>
              {values.length > 0 ? values[0].unit : "-"}
            </Metric>
            <Text>Dernière valeur : {values[0]?.value ?? "-"}</Text>
            <Text>Moyenne : {avg}</Text>
            <Text>Mesures : {values.length}</Text>
          </Card>
        );
      })}
    </Grid>
  );
}

function PostSimulator({ onSuccess }) {
  const [json, setJson] = useState('[{"name":"temperature","value":22.5,"unit":"C","timestamp":' + Math.floor(Date.now()/1000) + '}]');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    let payload;
    try {
      payload = JSON.parse(json);
      if (!Array.isArray(payload)) throw new Error("Payload must be an array");
    } catch (e) {
      setError("JSON invalide : " + e.message);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}`, payload);
      setResponse(res.data);
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>Simuler une requête POST</Title>
      <Text>Envoie un tableau JSON au backend pour simuler une mesure.</Text>
      <TextInput
        value={json}
        onChange={e => setJson(e.target.value)}
        placeholder="[ { name, value, unit, timestamp } ]"
        className="my-2 font-mono"
        rows={5}
        as="textarea"
      />
      <Flex className="gap-2">
        <Button loading={loading} onClick={handleSend} color="indigo" className="!text-black">Envoyer</Button>
        <Button variant="light" onClick={() => setJson('[{"name":"temperature","value":22.5,"unit":"C","timestamp":' + Math.floor(Date.now()/1000) + '}]')}>Réinitialiser</Button>
      </Flex>
      {error && <Callout color="rose" title="Erreur">{error}</Callout>}
      {response && <Callout color="green" title="Réponse du backend">{JSON.stringify(response)}</Callout>}
    </Card>
  );
}






export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/all`).then(res => {
      setData(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [refresh]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <Card className="max-w-5xl mx-auto shadow-lg">
        <Title>Dashboard IoT Sensors</Title>
        <Text>Visualisation temps réel & simulateur de requêtes POST</Text>
        <Divider />
        <TabGroup index={tab} onIndexChange={setTab}>
          <TabList>
            <Tab>Visualisation</Tab>
            <Tab>Simulation POST</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? <Text>Chargement...</Text> : (
                data.length === 0 ? <Text>Aucune donnée disponible.</Text> : (
                  <>
                    {console.log("DATA", JSON.stringify(data))}
                    <DataSummary data={data} />
                    <Divider />
                    <SensorCharts data={data} />
                  </>
                )
              )}
            </TabPanel>
            <TabPanel>
              <PostSimulator onSuccess={() => setRefresh(r => !r)} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Card>
      <Text className="text-center mt-8 text-slate-400 text-xs">Made with Tremor, React &lt;3</Text>
    </main>
  );
}
