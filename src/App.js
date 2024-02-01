import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Dashboard from './components/Dashboard';
import Producao from './components/Producao';
import AppNavbar from './components/AppNavbar';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import { collection, 
   onSnapshot, 
   query, orderBy,
   } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [pacientesProd, setPacientesProd] = useState([]);


  const agruparPorHospital = (pacientes) => {
    return pacientes.reduce((acc, paciente) => {
      acc[paciente.hospital] = acc[paciente.hospital] || [];
      acc[paciente.hospital].push(paciente);
      return acc;
    }, {});
  };


  useEffect(() => {
    const filtrarEAgruparPacientes = (pacientes, mostrarAlta) => {
      const pacientesFiltrados = pacientes.filter(p => p.alta === mostrarAlta);
      return agruparPorHospital(pacientesFiltrados);
    };
    let queryConstruida = collection(db, "pacientes");
    
    // if (mostrarAlta) {
    //   queryConstruida = query(queryConstruida, 
    //                             where("alta", "==", true), 
    //                             orderBy("hospital"), // Primeiro ordena por hospital
    //                             orderBy("nome")   );
    // } else {
      queryConstruida = query(queryConstruida, 
                              orderBy("hospital"), // Primeiro ordena por hospital
                              orderBy("setor")   );
   // }
  
    const unsubscribe = onSnapshot(queryConstruida, (snapshot) => {
      const pacientesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setPacientesProd(pacientesData)
      const pacientesFiltradosEAgrupados = filtrarEAgruparPacientes(pacientesData, mostrarAlta);
      setPacientes(pacientesFiltradosEAgrupados);
    });
  
    return () => unsubscribe();
  }, [mostrarAlta]);


  return (
    <AuthProvider>
      <Router>
      <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/producao" element={<Producao pacientes={pacientesProd} />} />
          <Route path="/" element={<PrivateRoute><Dashboard pacientes={pacientes}
                                                            setPacientes={setPacientes} 
                                                            mostrarAlta={mostrarAlta} 
                                                            setMostrarAlta={setMostrarAlta}/></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
