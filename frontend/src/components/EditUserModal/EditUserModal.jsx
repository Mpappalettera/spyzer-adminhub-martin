import { useState, useEffect } from 'react'
import { Modal } from '@/components/Modal'
import styles from './EditUserModal.module.css'

export function EditUserModal({ isOpen, onClose, userData, onSave }) {
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar estados cuando el modal se abre
  useEffect(() => {
    if (isOpen && userData) {
      const name = [userData.nombre, userData.apellido].filter(Boolean).join(' ')
      setNombreCompleto(name)
      setCorreo(userData.email || '')
      setTelefono(userData.telefono || '')
      setUbicacion(userData.ubicacion || userData.direccion || '')
      setErrors({})
    }
  }, [isOpen, userData])

  // Validación local de campos
  const validate = () => {
    const newErrors = {}

    if (!nombreCompleto.trim()) {
      newErrors.nombre = 'El nombre no puede estar vacío.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo.trim()) {
      newErrors.correo = 'El correo no puede estar vacío.'
    } else if (!emailRegex.test(correo)) {
      newErrors.correo = 'Formato de correo electrónico inválido.'
    }

    const phoneRegex = /^[0-9+\s()\-]*$/
    if (!telefono.trim()) {
      newErrors.telefono = 'El teléfono no puede estar vacío.'
    } else if (!phoneRegex.test(telefono)) {
      newErrors.telefono = 'El teléfono contiene caracteres inválidos.'
    } else if (telefono.replace(/[^0-9]/g, '').length < 6) {
      newErrors.telefono = 'Debe tener al menos 6 dígitos.'
    }

    if (!ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación no puede estar vacía.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const nameParts = nombreCompleto.trim().split(/\s+/)
    const nombre = nameParts[0] || ''
    const apellido = nameParts.slice(1).join(' ') || ''

    const updatedData = {
      nombre,
      apellido,
      email: correo,
      telefono,
      direccion: ubicacion // Mapeamos ubicación al campo 'direccion' de la base de datos
    }

    try {
      await onSave(updatedData)
      onClose()
    } catch (err) {
      setErrors({ api: err.message || 'Error al guardar los cambios.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Información del Cliente">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {errors.api && (
          <div className={styles.apiError}>
            {errors.api}
          </div>
        )}

        {/* Nombre Completo */}
        <div className={`${styles.inputGroup} ${errors.nombre ? styles.hasError : ''}`}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="edit-nombre"
              className={styles.input}
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
            <label 
              htmlFor="edit-nombre" 
              className={`${styles.label} ${nombreCompleto ? styles.floated : ''}`}
            >
              Nombre Completo
            </label>
            <span className={styles.focusBorder}></span>
          </div>
          {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
        </div>

        {/* Correo Electrónico */}
        <div className={`${styles.inputGroup} ${errors.correo ? styles.hasError : ''}`}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              id="edit-correo"
              className={styles.input}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <label 
              htmlFor="edit-correo" 
              className={`${styles.label} ${correo ? styles.floated : ''}`}
            >
              Correo Electrónico
            </label>
            <span className={styles.focusBorder}></span>
          </div>
          {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
        </div>

        {/* Teléfono */}
        <div className={`${styles.inputGroup} ${errors.telefono ? styles.hasError : ''}`}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="edit-telefono"
              className={styles.input}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <label 
              htmlFor="edit-telefono" 
              className={`${styles.label} ${telefono ? styles.floated : ''}`}
            >
              Teléfono
            </label>
            <span className={styles.focusBorder}></span>
          </div>
          {errors.telefono && <span className={styles.errorText}>{errors.telefono}</span>}
        </div>

        {/* Ubicación */}
        <div className={`${styles.inputGroup} ${errors.ubicacion ? styles.hasError : ''}`}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="edit-ubicacion"
              className={styles.input}
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
            />
            <label 
              htmlFor="edit-ubicacion" 
              className={`${styles.label} ${ubicacion ? styles.floated : ''}`}
            >
              Ubicación
            </label>
            <span className={styles.focusBorder}></span>
          </div>
          {errors.ubicacion && <span className={styles.errorText}>{errors.ubicacion}</span>}
        </div>

        {/* Botones de Acción */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.saveBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
