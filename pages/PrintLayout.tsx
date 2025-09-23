import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CertificatePrintPage from '../components/CertificatePrintPage';
import { getRequestById } from '../services/requestService';
import { DocumentRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PrintLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && token) {
      getRequestById(id, token)
        .then(response => {
          setRequest(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch request details:', error);
          setLoading(false);
        });
    } else if (!token) {
        console.error('No auth token available');
        setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (!loading && request) {
      window.print();
    }
  }, [loading, request]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <CertificatePrintPage ref={componentRef} request={request} />;
};

export default PrintLayout;
