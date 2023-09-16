async function register ({
    registerSetting,
    settingsManager,
    transcodingManager
  }) {
    const defaultCRF = 20
  
    const store = {
      crf: await settingsManager.getSetting('crf') || defaultCRF
    }
  
    settingsManager.onSettingsChange(settings => {
      store.crf = settings['crf']
    })
  
    const builderVOD = (options) => {
      return {
        outputOptions: [
          `-r ${options.fps}`,
          `-crf ${store.crf}`
        ]
      }
    }
  
    const buildLive = (options) => {
      return {
        outputOptions: [
          `${buildStreamSuffix('-r:v', options.streamNum)} ${options.fps}`,
          `-crf ${store.crf}`
        ]
      }
    }
  
    registerSetting({
      name: 'crf',
      label: 'Quality',
      type: 'select',
      options: [
        { label: 'Default', value: 23 },
        { label: 'Good', value: 20 },
        { label: 'Very good', value: 17 },
        { label: 'Excellent', value: 14 }
      ],
      descriptionHTML: 'Increasing quality will result in bigger video sizes',
      private: true,
      default: defaultCRF
    })
  
    const encoder = 'libx264'
    const profileName = 'custom-quality'
  
    transcodingManager.addVODProfile(encoder, profileName, builderVOD)
    transcodingManager.addLiveProfile(encoder, profileName, buildLive)
  }
  
  async function unregister () {
    return
  }
  
  module.exports = {
    register,
    unregister
  }
  
  
  // ---------------------------------------------------------------------------
  
  function buildStreamSuffix (base, streamNum) {
    if (streamNum !== undefined) {
      return `${base}:${streamNum}`
    }
  
    return base
  }
  