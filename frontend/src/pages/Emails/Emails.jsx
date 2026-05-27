import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, Send, Check, Link2, Trash2, Star } from 'lucide-react'
import { Card } from '@/components/Card/Card'
import { Badge } from '@/components/Badge/Badge'
import WheelPagination from '@/components/WheelPagination/WheelPagination'
import { clientService } from '@/services/clientService'
import { emailService } from '@/services/emailService'
import styles from './Emails.module.css'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}



const DEFAULT_TEMPLATE = "Escribe el contenido de tu correo aquí...";

export default function Emails() {
  const [activeRisk, setActiveRisk] = useState('Todos')
  const [capitalRange, setCapitalRange] = useState(10000)
  const [emailBody, setEmailBody] = useState(DEFAULT_TEMPLATE)
  const [emailSubject, setEmailSubject] = useState("Actualización de Rendimiento T3")
  const [currentPage, setCurrentPage] = useState(0)
  const [clients, setClients] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const textareaRef = useRef(null)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const [c, camp, temps] = await Promise.all([
          clientService.getClients(),
          emailService.getCampaigns(),
          emailService.getEmailTemplates()
        ])
        if (isMounted) {
          setClients(c)
          setCampaigns(camp)
          setTemplates(temps)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching email data:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  // Calculate target audience reactive to Role and Minimum Capital
  const targetAudienceCount = useMemo(() => {
    return clients.filter(c => {
      let matchesRole = true;
      if (activeRisk === 'Activos') matchesRole = c.accountStatus === 'Active';
      else if (activeRisk === 'VIPs') matchesRole = c.accountStatus === 'VIP';
      else if (activeRisk === 'Inactivos') matchesRole = c.accountStatus === 'Inactive';
      
      const matchesCapital = c.totalCapitalInvested >= capitalRange;
      
      return matchesRole && matchesCapital;
    }).length;
  }, [activeRisk, capitalRange, clients])

  // Automatically switch template when selecting VIPs or Activos
  useEffect(() => {
    let bodyToSet = DEFAULT_TEMPLATE;
    let subjectToSet = "Actualización de Rendimiento T3";

    if (activeRisk === 'VIPs') {
      const vipTemp = templates.find(t => t.nombre?.toLowerCase().includes('oferta vip') || t.nombre?.toLowerCase().includes('vip'));
      if (vipTemp) {
        bodyToSet = vipTemp.cuerpo;
        subjectToSet = vipTemp.asunto || '';
      }
    } else if (activeRisk === 'Activos') {
      const activeTemp = templates.find(t => t.nombre?.toLowerCase().includes('bienvenida premium'));
      if (activeTemp) {
        bodyToSet = activeTemp.cuerpo;
        subjectToSet = activeTemp.asunto || '';
      }
    } else if (activeRisk === 'Inactivos') {
      const inactiveTemp = templates.find(t => t.nombre?.toLowerCase().includes('reactivación'));
      if (inactiveTemp) {
        bodyToSet = inactiveTemp.cuerpo;
        subjectToSet = inactiveTemp.asunto || '';
      }
    }

    // Append the review link explicitly as requested by user ALWAYS
    if (bodyToSet !== DEFAULT_TEMPLATE) {
      const reviewLinkText = `\n\n⭐ [Valorar servicio](${window.location.origin}/reviews-form)`;
      if (!bodyToSet.includes('/reviews-form')) {
        bodyToSet += reviewLinkText;
      }
    }

    setEmailBody(bodyToSet);
    setEmailSubject(subjectToSet);
  }, [activeRisk, templates])


  // Filter sent campaigns
  const sentCampaigns = useMemo(() => {
    return campaigns
      .filter(c => c.estado.toLowerCase() === 'sent')
      .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
  }, [campaigns]);
  const totalPages = Math.ceil(sentCampaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return sentCampaigns.slice(start, start + ITEMS_PER_PAGE);
  }, [sentCampaigns, currentPage]);

  const handleFormat = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = emailBody.substring(start, end);
    let newText = emailBody;

    if (type === 'bold') {
      newText = emailBody.substring(0, start) + `**${selectedText || 'texto_negrita'}**` + emailBody.substring(end);
    } else if (type === 'link') {
      newText = emailBody.substring(0, start) + `[${selectedText || 'texto_enlace'}](https://)` + emailBody.substring(end);
    }
    
    setEmailBody(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + (type === 'bold' ? 2 : 1), end + (type === 'bold' ? 2 : 1));
    }, 0);
  };

  const handleClear = () => setEmailBody('');

  const handleSendCampaign = async () => {
    if (isSending || isSent || !emailBody || emailBody === DEFAULT_TEMPLATE) return
    setIsSending(true)
    try {
      // Append the HTML review button at the footer of the email body
      const reviewUrl = `${window.location.origin}/reviews-form`
      const emailBodyWithFooter = `${emailBody}\n\n<!-- Bulletproof button para email -->\n<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto;">\n  <tr>\n    <td style="border-radius: 8px; background: #aec6ff; text-align: center;">\n      <a href="${reviewUrl}" target="_blank" style="background: #aec6ff; border: 1px solid #aec6ff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; color: #002e6b; display: inline-block; border-radius: 8px;">\n        ⭐ Déjanos tu reseña\n      </a>\n    </td>\n  </tr>\n</table>`

      const newCamp = await emailService.sendCampaign({
        publicoObjetivo: activeRisk === 'Todos' ? 'All Clients' : (activeRisk === 'VIPs' ? 'VIP Clients' : activeRisk),
        asunto: emailSubject,
        cuerpo: emailBodyWithFooter,
        destinatarios: String(targetAudienceCount),
        estado: 'SENT'
      })
      
      setCampaigns(prev => [newCamp, ...prev])
      setIsSent(true)
      setTimeout(() => {
        setIsSent(false)
        setIsSending(false)
        setEmailBody(DEFAULT_TEMPLATE)
        setEmailSubject("Actualización de Rendimiento T3")
      }, 3000)
    } catch (error) {
      console.error('Error sending campaign:', error)
      setIsSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--outline)', fontSize: 'var(--body-lg-size)' }}>
        Cargando módulo de correos...
      </div>
    )
  }


  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      <motion.div className={styles.pageHeader} variants={slideUp}>
        <h1>Módulo de Campañas de Email</h1>
        <p>Dirígete a segmentos específicos y redacta campañas en texto enriquecido.</p>
      </motion.div>

      <div className={styles.composerGrid}>
        {/* Audience Targeting Panel */}
        <motion.div variants={slideUp}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.sectionTitle}>
              <Users className={styles.sectionIcon} size={20} />
              Segmentación de Audiencia
            </div>

            <div style={{ marginTop: 'var(--space-md)' }}>
              <div className={styles.fieldLabel}>Rol destinatario</div>
              <div className={styles.riskPills}>
                {['Todos', 'Activos', 'VIPs', 'Inactivos'].map(risk => {
                  let colorClass = styles.riskPillWhite;
                  if (risk === 'Todos') colorClass = styles.riskPillWhite;
                  if (risk === 'Activos') colorClass = styles.riskPillGreen;
                  if (risk === 'VIPs') colorClass = styles.riskPillBlue;
                  if (risk === 'Inactivos') colorClass = styles.riskPillRed;

                  return (
                    <button
                      key={risk}
                      className={
                        activeRisk === risk 
                          ? `${styles.riskPillActive} ${colorClass}`
                          : styles.riskPill
                      }
                      onClick={() => setActiveRisk(risk)}
                    >
                      {risk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.capitalRange}>
              <div className={styles.rangeHeader}>
                <span className={styles.fieldLabel} style={{ marginBottom: 0 }}>Capital Invertido (Mín)</span>
                <span className={styles.rangeValue}>${(capitalRange / 1000).toFixed(0)}k+</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="5000"
                value={capitalRange}
                onChange={(e) => setCapitalRange(Number(e.target.value))}
                className={styles.rangeSlider}
              />
              <div className={styles.rangeLabels}>
                <span>$0</span>
                <span>$2M+</span>
              </div>
            </div>

            <div className={styles.targetAudience}>
              <div>
                <div className={styles.targetLabel}>Público Objetivo</div>
                <div className={styles.targetCount}>
                  {targetAudienceCount.toLocaleString()}<span className={styles.targetUnit}>clientes</span>
                </div>
              </div>
              <Users className={styles.targetIcon} size={24} />
            </div>
          </Card>
        </motion.div>

        {/* Composer Panel */}
        <motion.div variants={slideUp}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.composerHeader}>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                Redactar Campaña
              </div>
              <div className={styles.templateSelect}>
                <span style={{ marginRight: '8px' }}>Plantilla:</span>
                <select 
                  className={styles.dropdown} 
                  style={{ marginBottom: 0, padding: '4px 24px 4px 12px', width: 'auto' }}
                  onChange={(e) => {
                    const val = e.target.value;
                    const selected = templates.find(t => String(t.id) === val);
                    if (selected) {
                      let newBody = selected.cuerpo;
                      const reviewLinkText = `\n\n⭐ [Valorar servicio](${window.location.origin}/reviews-form)`;
                      if (!newBody.includes('/reviews-form')) {
                        newBody += reviewLinkText;
                      }
                      setEmailBody(newBody);
                      setEmailSubject(selected.asunto || "Actualización de Rendimiento T3");
                    } else {
                      setEmailBody(DEFAULT_TEMPLATE);
                      setEmailSubject("Actualización de Rendimiento T3");
                    }
                  }}
                  value={
                    templates.find(t => t.cuerpo === emailBody)?.id || 'Personalizado'
                  }
                >
                  <option value="Personalizado">Personalizado</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>


            <div className={styles.fieldLabel}>Asunto correo</div>
            <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
              <input
                type="text"
                className={styles.subjectInput}
                style={{ marginBottom: 0, paddingRight: '40px' }}
                placeholder="Asunto de la Campaña"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <button 
                className={styles.toolbarBtn} 
                title="Limpiar Asunto" 
                onClick={() => setEmailSubject('')} 
                style={{ position: 'absolute', right: 'var(--space-sm)', top: '50%', transform: 'translateY(-50%)', color: 'var(--loss)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className={styles.fieldLabel} style={{ marginTop: 'var(--space-md)' }}>Cuerpo correo</div>
            <div className={styles.toolbar} style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className={styles.toolbarBtn} title="Negrita" onClick={() => handleFormat('bold')}><b>B</b></button>
                <button className={styles.toolbarBtn} title="Enlace" onClick={() => handleFormat('link')}><Link2 size={16} /></button>
                <button
                  className={styles.toolbarBtn}
                  title="Insertar enlace de Reseña"
                  onClick={() => {
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = emailBody.substring(start, end);
                    const reviewUrl = `${window.location.origin}/reviews-form`;
                    const newText = emailBody.substring(0, start) + `[${selectedText || 'Valorar servicio'}](${reviewUrl})` + emailBody.substring(end);
                    setEmailBody(newText);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Star size={14} style={{ color: 'var(--secondary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>Reseña</span>
                </button>
              </div>
              <button className={styles.toolbarBtn} title="Limpiar" onClick={handleClear} style={{ color: 'var(--loss)' }}>
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.bodyTextarea}
              placeholder="Escribe el contenido de tu correo aquí..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />

            <div className={styles.composerActions}>
              {/* Uiverse Animated Send Button */}
              <button 
                className={`${styles.sendButton} ${isSent ? styles.sent : ''}`} 
                onClick={handleSendCampaign}
                disabled={isSending}
                tabIndex="0"
              >

                <div className={styles.sendOutline}></div>
                
                <div className={`${styles.sendState} ${styles.sendStateDefault}`}>
                  <div className={styles.sendIcon}>
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g style={{filter: 'url(#shadow)'}}>
                        <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                        <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
                      </g>
                      <defs>
                        <filter id="shadow">
                          <feDropShadow dx={0} dy={1} stdDeviation="0.6" floodOpacity="0.5" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                  <p>
                    <span style={{ '--i': 0 }}>S</span>
                    <span style={{ '--i': 1 }}>e</span>
                    <span style={{ '--i': 2 }}>n</span>
                    <span style={{ '--i': 3 }}>d</span>
                    <span style={{ '--i': 4 }}>M</span>
                    <span style={{ '--i': 5 }}>e</span>
                    <span style={{ '--i': 6 }}>s</span>
                    <span style={{ '--i': 7 }}>s</span>
                    <span style={{ '--i': 8 }}>a</span>
                    <span style={{ '--i': 9 }}>g</span>
                    <span style={{ '--i': 10 }}>e</span>
                  </p>
                </div>
                
                <div className={`${styles.sendState} ${styles.sendStateSent}`}>
                  <div className={styles.sendIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1em" width="1em" strokeWidth="0.5px" stroke="black">
                      <g style={{filter: 'url(#shadow)'}}>
                        <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
                        <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
                      </g>
                    </svg>
                  </div>
                  <p>
                    <span style={{ '--i': 5 }}>S</span>
                    <span style={{ '--i': 6 }}>e</span>
                    <span style={{ '--i': 7 }}>n</span>
                    <span style={{ '--i': 8 }}>t</span>
                  </p>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Campaigns Table */}
      <motion.div variants={slideUp}>
        <div className={styles.campaignsCard}>
          <div className={styles.tableHeaderWrapper}>
            <span className={styles.tableTitle}>Campañas Recientes Enviadas</span>
          </div>
          
          <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
              <div className={styles.headerItem}>Asunto</div>
              <div className={styles.headerItem}>Rol</div>
              <div className={styles.headerItem}>Personas Alcanzadas</div>
              <div className={styles.headerItem}>Fecha</div>
            </div>
            
            {paginatedCampaigns.map((camp) => (
              <div key={camp.id} className={styles.tableRow}>
                <div className={styles.campaignName}>{camp.asunto}</div>
                <div className={styles.cellCenter}>
                  <span className={styles.cellText}>
                    {camp.publicoObjetivo === 'All Clients' ? 'Todos los Clientes' : 
                     camp.publicoObjetivo === 'Inactive > 30d' ? 'Inactivos > 30d' : 
                     camp.publicoObjetivo}
                  </span>
                </div>
                <div className={styles.cellCenter}>
                  <span className={styles.cellText} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {camp.totalDestinatarios !== undefined ? camp.totalDestinatarios : camp.destinatarios}
                  </span>
                </div>
                <div className={styles.cellCenter}>
                  <span className={styles.cellText}>
                    {camp.fechaEnvio ? new Date(camp.fechaEnvio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <WheelPagination 
                  active={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
