import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import Api from "@/app/utils/Api";
const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [satuan, setSatuans] = useState([]);
  const [dana, setDana] = useState([]);
  const [gedung, setGedung] = useState([]);
  const [ruangan, setRuangan] = useState([]);
  const [kategoriAset, setKategoriAset] = useState([]);
  const [atkFilter, setAtkFilter] = useState([]);
  const [memberFilter, setMemberFilter] = useState([]);
  const [pibarFilter, setPibarFilter] = useState([]);
  const [ruanganFilter, setRuanganFilter] = useState([]);
  const [inventarisFilter, setInventarisFilter] = useState([]);
  const [waka, setWaka] = useState("");
  const [teams, setTeams] = useState([]);
  const [labs, setLabs] = useState([]);
  const getOpsi = useCallback(async () => {
    const response = await Api.get("/sp/opsi");
    setRoles(response.data.roles);
    setPositions(response.data.positions);
    setSatuans(response.data.satuans);
    setDana(response.data.sumberDana);
    setGedung(response.data.gedung);
    setKategoriAset(response.data.kategoriAset);
    setLabs(response.data.labs);
  }, []);
  const getWaka = async () => {
    const response = await Api.get("/sp/teams");
    setTeams(response.data.data);
    const waka = response.data.data.find(item => item.jabatan === 'WAKASEK IT, LAB & SARPRA');
    if (waka) {
      setWaka(waka);
    }
  };
  const getRuanganByGedung = useCallback(async (gedungId) => {
    const response = await Api.get(`/sp/opsi/ruangan/${gedungId}`);
    setRuangan(response.data.ruangan);
  }, []);

  const getAtkFilter = useCallback(async (search = "") => {
    const response = await Api.get("/sp/opsi/atk-filter?search=" + search);
    setAtkFilter(response.data.atk);
  }, []);
  const getMemberFilter = useCallback(async (search = "") => {
    const response = await Api.get("/sp/opsi/member-filter?search=" + search);
    setMemberFilter(response.data.member || []);
  }, []);
  const getPibarFilter = useCallback(async (search = "") => {
    const response = await Api.get("/sp/opsi/pibar-filter?search=" + search);
    setPibarFilter(response.data.pibar);
  }, []);

  const AtkFilter = useCallback(async (search = "") => {
    try {
      const response = await Api.get("/sp/opsi/atk-filter?search=" + search);
      return response.data.atk || [];
    } catch (error) {
      console.error('Error fetching ATK filter:', error);
      return [];
    }
  }, []);

  const MemberFilter = useCallback(async (search = "") => {
    try {
      const response = await Api.get("/sp/opsi/member-filter?search=" + search);
      return response.data.member || [];
    } catch (error) {
      console.error('Error fetching Member filter:', error);
      return [];
    }
  }, []);
  const PibarFilter = useCallback(async (search = "") => {
    try {
      const response = await Api.get("/sp/opsi/pibar-filter?search=" + search);
      return response.data.pibar || [];
    } catch (error) {
      console.error('Error fetching Pibar filter:', error);
      return [];
    }
  }, []);
  const getRuanganFilter = useCallback(async (search = "") => {
    const response = await Api.get("/sp/opsi/ruangan-filter?search=" + search);
    setRuanganFilter(response.data.ruangan);
  }, []);
  const RuanganFilter = useCallback(async (search = "") => {
    try {
      const response = await Api.get("/sp/opsi/ruangan-filter?search=" + search);
      return response.data.ruangan || [];
    } catch (error) {
      console.error('Error fetching Ruangan filter:', error);
      return [];
    }
  }, []);
  const getInventarisFilter = useCallback(async (search = "") => {
    const response = await Api.get("/sp/opsi/inventaris-filter?search=" + search);
    setInventarisFilter(response.data.inventaris);
  }, []);
  const InventarisFilter = useCallback(async (search = "") => {
    try {
      const response = await Api.get("/sp/opsi/inventaris-filter?search=" + search);
      return response.data.inventaris || [];
    } catch (error) {
      console.error('Error fetching Inventaris filter:', error);
      return [];
    }
  }, []);

  // ============================================
  // WEBSOCKET MANAGEMENT
  // ============================================
  const wsRef = useRef(null);
  const listenersRef = useRef(new Map()); // Map<msgType, Set<callback>>

  // Subscribe to WebSocket message type
  const subscribeWebSocket = useCallback((msgType, callback) => {
    if (!listenersRef.current.has(msgType)) {
      listenersRef.current.set(msgType, new Set());
    }
    listenersRef.current.get(msgType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = listenersRef.current.get(msgType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listenersRef.current.delete(msgType);
        }
      }
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://api7.sistelk.id';

    try {
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // WebSocket connected
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const callbacks = listenersRef.current.get(msg.type);

          if (callbacks && callbacks.size > 0) {
            // Call all registered callbacks for this message type
            callbacks.forEach(callback => {
              try {
                callback(msg);
              } catch (error) {
                // Handle callback error silently
              }
            });
          }
        } catch (error) {
          // Handle parse error silently
        }
      };

      ws.onerror = (error) => {
        // Handle WebSocket error silently
      };

      ws.onclose = () => {
        // WebSocket disconnected, will reconnect on next mount
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
        wsRef.current = null;
      };
    } catch (error) {
      // Handle WebSocket initialization error silently
    }
  }, []);


  return (
    <DataContext.Provider
      value={{
        roles,
        getOpsi,
        positions,
        satuan,
        dana,
        gedung,
        ruangan,
        getRuanganByGedung,
        kategoriAset,
        atkFilter,
        getAtkFilter,
        AtkFilter,
        memberFilter,
        getMemberFilter,
        MemberFilter,
        pibarFilter,
        getPibarFilter,
        PibarFilter,
        subscribeWebSocket,
        ruanganFilter,
        getRuanganFilter,
        RuanganFilter,
        waka,
        getWaka,
        inventarisFilter,
        getInventarisFilter,
        InventarisFilter,
        labs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
