import { createContext, useContext, useState, useCallback } from "react";
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
  const getOpsi = useCallback(async () => {
    const response = await Api.get("/sp/opsi");
    setRoles(response.data.roles);
    setPositions(response.data.positions);
    setSatuans(response.data.satuans);
    setDana(response.data.sumberDana);
    setGedung(response.data.gedung);
    setKategoriAset(response.data.kategoriAset);
  }, []);

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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
