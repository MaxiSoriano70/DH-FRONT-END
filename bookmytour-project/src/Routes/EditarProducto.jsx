import { useTours } from "../hooks/useTours";
import Styles from "../Styles/AgregarProducto.module.css";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import TextInput from "../Components/TextInput";
import Button from "../Components/Button";
import { useContextGlobalStates } from "../Components/utils/global.context";

const EditarProducto = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { state } = useContextGlobalStates();
  const { updateTour } = useTours();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const { id } = useParams();

  const tour = state.data.find((tour) => tour.tourId === parseInt(id));

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    costo: "",
    ciudad: [],
    duracion: "",
    resumen: "",
    descripcion: "",
    itinerario: "",
    imagen: [],
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        nombre: tour.name,
        categoria: tour.categoryName,
        costo: tour.costPerPerson,
        ciudad: tour.cityNames || [],
        duracion: tour.duration,
        resumen: tour.summary,
        descripcion: tour.description,
        itinerario: tour.itinerary,
        imagen: tour.imagenes,
      });
    }
  }, [tour]);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      // Si no hay un usuario en localStorage, redirige al home
      navigate("/");
    } else {
      const usuario = JSON.parse(user);
      // Verificar si el usuario es vacío o no tiene el rol correcto
      if (
        !usuario ||
        !usuario.usuario ||
        usuario.usuario.rol.rolName !== "ADMIN"
      ) {
        navigate("/");
      }
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchCities() {
      const response = await fetch("https://bookmytourweb.online/api/cities");
      const data = await response.json();
      setCities(data);
    }
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log(name, value);
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.nombre);
    formDataToSend.append("categoryName", formData.categoria);
    formDataToSend.append("costPerPerson", formData.costo);
    formDataToSend.append("datesAvailable", formData.disponibilidad);
    formDataToSend.append("cityNames", formData.ciudad);
    formDataToSend.append("duration", formData.duracion);
    formDataToSend.append("summary", formData.resumen);
    formDataToSend.append("description", formData.descripcion);
    formDataToSend.append("itinerary", formData.itinerario);

    selectedFiles.forEach((file) => {
      formDataToSend.append("imagenes", file);
    });

    try {
      const updatedTour = await updateTour(id, formDataToSend);
      console.log("respuesta", updatedTour);

      if (updatedTour.message === "Tour actualizado con éxito") {
        toast.success("Producto actualizado exitosamente!", {
          position: "top-center",
        });
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setTimeout(() => {
          navigate("/productos");
        }, 1000);
      }
    } catch (err) {
      console.error("Error al actualizar el producto:", err);
      toast.error("Hubo un error al actualizar el producto");
    }
  };

  return (
    <div className={Styles.mainContainer}>
      <ToastContainer position="top-center" />
      <div className={Styles.container}>
        <h1>Editar Producto</h1>
        <form className={Styles.form} onSubmit={handleSubmit}>
          <section className={Styles.formContainer}>
            <div className={Styles.formulario1}>
              <TextInput
                label="Nombre"
                placeholder="Ingresa el nombre del tour"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                customClass={Styles.formInput}
              />
              <div>
                <label htmlFor="select">Categoría:</label>
                <select
                  id="select"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  <option value="Aventura">Aventura</option>
                  <option value="Naturaleza Viva">Naturaleza viva</option>
                  <option value="Aromas y Sabores">Aromas y sabores</option>
                  <option value="Vibra Urbana">Vibra urbana</option>
                  <option value="Paraísos del Caribe">
                    Paraisos del caribe
                  </option>
                </select>
              </div>

              <TextInput
                label="Costo"
                placeholder="Ingresa el costo del tour"
                type="number"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                customClass={Styles.formInput}
              />

              <div>
                <label htmlFor="select">Ciudades:</label>
                <select
                  id="selectCities"
                  name="ciudad"
                  multiple
                  onChange={(e) => {
                    // Obtener las opciones seleccionadas
                    const options = Array.from(e.target.selectedOptions);
                    const selectedValues = options.map(
                      (option) => option.value
                    );

                    // Reemplazar las ciudades anteriores por las nuevas seleccionadas
                    setFormData({
                      ...formData, // Mantener el resto del estado sin cambios
                      ciudad: selectedValues, // Solo actualizar las ciudades
                    });
                  }}
                  value={formData.ciudad} // El estado actualizado de ciudades seleccionadas
                >
                  <option value="" disabled>
                    Selecciona las ciudades
                  </option>
                  {cities.map((city) => (
                    <option key={city.cityId} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <TextInput
                label="Duración"
                placeholder="Ingresa la duración del tour, por ejemplo: 3 dias 4 noches"
                type="text"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                customClass={Styles.formInput}
              />
              <div>
                <label>Descripción General:</label>
                <textarea
                  rows={5}
                  name="descripcion"
                  placeholder="Ingresa una descripción general del tour"
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </div>
            </div>
            <section className={Styles.formulario2}>
              <div>
                <label>
                  Sube imágenes:
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginBottom: "10px" }}
                  />
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {formData.imagen.length > 0
                    ? formData.imagen.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                          }}
                        />
                      ))
                    : null}
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <label>Resumen:</label>
                  <textarea
                    rows={5}
                    name="resumen"
                    placeholder="Ingresa un resumen breve del tour"
                    value={formData.resumen}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Itinerario:</label>
                  <textarea
                    rows={5}
                    name="itinerario"
                    placeholder="Ingresa un itinerario detallado del tour"
                    value={formData.itinerario}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className={Styles.botones}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  type="button"
                  onClick={() => navigate("/productos")}
                />
                <Button label="Guardar" variant="primary" type="submit" />
              </div>
            </section>
          </section>
        </form>
      </div>
    </div>
  );
};

export default EditarProducto;
