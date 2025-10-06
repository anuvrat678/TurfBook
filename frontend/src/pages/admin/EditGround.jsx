import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Upload, Loader, ChevronLeft, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/admin/TextEditor'; 

const EditGround = () => {
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm();
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [is24x7, setIs24x7] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState('');

  // Watch form values
  const watchIs24x7 = watch('is24x7');
  const watchOpeningTime = watch('openingTime');
  const watchClosingTime = watch('closingTime');

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const { data } = await api.get(`/grounds/${id}`);
        
        // Convert is24x7 to boolean
        const is24x7Value = data.is24x7 === true || data.is24x7 === 'true';
        
        reset({
          ...data,
          ...data.location,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          price: Number(data.price).toFixed(2),
          is24x7: is24x7Value
        });
        
        setIs24x7(is24x7Value);
        setExistingImages(data.gallery);
        setDescription(data.description);
      } catch (error) {
        console.error('Error fetching ground:', error);
        navigate('/admin/grounds');
      }
    };
    fetchGround();
  }, [id, reset, navigate]);

  // Sync local state with form value
  useEffect(() => {
    if (watchIs24x7 !== undefined) {
      setIs24x7(watchIs24x7);
    }
  }, [watchIs24x7]);

  const descriptionError = !description || description.replace(/<[^>]*>/g, '').length < 50 ? 
    { message: "Description must be at least 50 characters" } : null;

  const handle24x7Toggle = (e) => {
    const isChecked = e.target.checked;
    
    // Update both state and form value
    setIs24x7(isChecked);
    setValue('is24x7', isChecked);
    
    if (isChecked) {
      // Set 24/7 times
      setValue('openingTime', '00:00');
      setValue('closingTime', '23:59');
    }
  };

  const handleTimeChange = (field, value) => {
    setValue(field, value);
    
    // If user manually changes time, uncheck 24/7
    if (is24x7) {
      setIs24x7(false);
      setValue('is24x7', false);
    }
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 8) {
      alert('Maximum 8 images allowed');
      return;
    }
    
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setNewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index, isExisting, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    if (existingImages.length + newImages.length === 0) {
      alert('Please keep at least one image');
      return;
    }

    // Validate description character count
    const plainTextDescription = description.replace(/<[^>]*>/g, '');
    if (!plainTextDescription || plainTextDescription.length < 50) {
      alert('Description must be at least 50 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add new images
      newImages.forEach(image => {
        formData.append('gallery', image.file);
      });

      // Prepare data with proper boolean conversion
      const submissionData = {
        ...data,
        description: description,
        price: parseFloat(data.price),
        is24x7: data.is24x7 === true || data.is24x7 === 'true'
      };

      // Append all data to formData
      Object.entries(submissionData).forEach(([key, value]) => {
        if (key.startsWith('location.')) {
          const locationKey = key.split('.')[1];
          formData.append(`location[${locationKey}]`, value);
        } else {
          formData.append(key, value);
        }
      });

      formData.append('existingGallery', JSON.stringify(existingImages));

      await api.put(`/grounds/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Ground updated successfully!');
      navigate('/admin/grounds');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Update failed: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/admin/grounds"
            className="flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Grounds
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            <span className="text-green-600">Edit</span>
            <span className="text-gray-800"> Ground</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold flex items-center text-green-700">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <MapPin className="w-5 h-5" />
                </span>
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Ground Name
                </label>
                <input
                  {...register("name", { required: "Ground name is required" })}
                  className={`w-full px-4 py-3 border-2 ${errors.name ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                  placeholder="Enter ground name"
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Description
                </label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  error={descriptionError}
                  placeholder="Describe the ground facilities, features, and rules..."
                />
                <div className="mt-2 text-sm text-gray-500">
                  {description ? description.replace(/<[^>]*>/g, '').length : 0} characters
                  {descriptionError && <span className="text-red-600 ml-2">(Minimum 50 characters required)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold flex items-center text-green-700">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <MapPin className="w-5 h-5" />
                </span>
                Location Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Full Address
                </label>
                <input
                  {...register("address", { required: "Address is required" })}
                  className={`w-full px-4 py-3 border-2 ${errors.address ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                  placeholder="Enter full address"
                />
                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    City
                  </label>
                  <input
                    {...register("city", { required: "City is required" })}
                    className={`w-full px-4 py-3 border-2 ${errors.city ? 'border-red-500' : 'border-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    State
                  </label>
                  <input
                    {...register("state", { required: "State is required" })}
                    className={`w-full px-4 py-3 border-2 ${errors.state ? 'border-red-500' : 'border-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Pincode
                  </label>
                  <input
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "Invalid pincode (6 digits required)"
                      }
                    })}
                    className={`w-full px-4 py-3 border-2 ${errors.pincode ? 'border-red-500' : 'border-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="mt-2 text-sm text-red-600">{errors.pincode.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Landmark
                  </label>
                  <input
                    {...register("landmark")}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Nearest landmark"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Timing Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold flex items-center text-green-700">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <DollarSign className="w-5 h-5" />
                </span>
                Pricing & Timing
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { 
                    required: "Price is required",
                    min: { value: 1, message: "Price must be at least ₹1" }
                  })}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.price ? 'border-red-500' : 'border-gray-400'
                  } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                  placeholder="Enter hourly rate"
                />
                {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="24x7"
                    {...register("is24x7")}
                    checked={is24x7}
                    onChange={handle24x7Toggle}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="24x7" className="ml-2 text-sm text-gray-700 font-medium">
                    Open 24/7
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      {...register("openingTime", { 
                        required: is24x7 ? false : "Opening time is required" 
                      })}
                      value={watchOpeningTime || ''}
                      onChange={(e) => handleTimeChange('openingTime', e.target.value)}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.openingTime ? 'border-red-500' : 'border-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                      disabled={is24x7}
                    />
                    {errors.openingTime && <p className="mt-2 text-sm text-red-600">{errors.openingTime.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      {...register("closingTime", { 
                        required: is24x7 ? false : "Closing time is required" 
                      })}
                      value={watchClosingTime || ''}
                      onChange={(e) => handleTimeChange('closingTime', e.target.value)}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.closingTime ? 'border-red-500' : 'border-gray-400'
                      } rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                      disabled={is24x7}
                    />
                    {errors.closingTime && <p className="mt-2 text-sm text-red-600">{errors.closingTime.message}</p>}
                  </div>
                </div>
                
                {is24x7 && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    ⏰ 24/7 Mode: Ground will be open from 00:00 to 23:59
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold flex items-center text-green-700">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <Upload className="w-5 h-5" />
                </span>
                Update Images
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Current Images ({existingImages.length + newImages.length}/8)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImages}
                    className="hidden"
                    id="image-upload"
                    disabled={existingImages.length + newImages.length >= 8}
                  />
                  <label 
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center min-h-48 border-2 border-dashed ${
                      existingImages.length + newImages.length > 0 ? 'border-green-500' : 'border-gray-400'
                    } rounded-xl cursor-pointer hover:border-green-500 transition-colors p-4`}
                  >
                    <div className="w-full">
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        {existingImages.map((img, index) => (
                          <div key={`existing-${index}`} className="relative aspect-square group">
                            <img
                              src={img}
                              alt={`Existing ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${
                                index === 0 ? 'ring-2 ring-green-500' : ''
                              }`}
                            />
                            {index === 0 && (
                              <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => removeImage(index, true, e)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {newImages.map((img, index) => (
                          <div key={`new-${index}`} className="relative aspect-square group">
                            <img
                              src={img.preview}
                              alt={`New ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${
                                existingImages.length + index === 0 ? 'ring-2 ring-green-500' : ''
                              }`}
                            />
                            {existingImages.length + index === 0 && (
                              <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => removeImage(index, false, e)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {(existingImages.length + newImages.length) < 8 && (
                          <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 mt-2">Add Images</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12">
            <button
              type="submit"
              disabled={isSubmitting || descriptionError}
              className="w-full py-4 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Ground'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGround;