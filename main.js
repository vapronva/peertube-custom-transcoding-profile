async function register({
    registerSetting,
    settingsManager,
    transcodingManager,
    peertubeHelpers,
}) {
    const { logger } = peertubeHelpers

    const vod_default_crf = 20
    const vod_default_preset = "slow"
    const vod_default_tune = null
    const vod_default_profile = "high"
    const vod_default_audio_config_enabled = false
    const vod_default_audio_configuration = "-b:a 320k -filter:a loudnorm=I=-16:TP=-1.0"
    const live_default_crf = 21
    const live_default_preset = "fast"
    const live_default_tune = "zerolatency"
    const live_default_profile = "high"
    const live_default_audio_config_enabled = false
    const live_default_audio_configuration = "-b:a 286k"

    const setting_crf_description =
    "Configure the encoding \"quality\". Lower values equate to superior quality but increased file sizes. The default setting is 23 (as per ffmpeg), with optimal values ranging from 18 to 28. Note the logarithmic range: an increase of 6 in the CRF value approximately doubles the file size, while a decrease of 6 halves it. Choose from a spectrum of 0-51."
    const setting_preset_description =
    "Specify the preset for encoding. A slower preset yields better compression, implying that for a specific file size or constant bit rate, a slower preset delivers enhanced quality. Conversely, for constant quality encoding, a slower preset conserves bitrate."
    const setting_tune_description =
    "Optimize settings for specific source types or scenarios. If you're uncertain, it's advisable to leave this setting as None."
    const setting_profile_description =
    "Designate the profile for encoding. Bear in mind that certain codecs do not support all profiles, and not every device is compatible with all profiles. If in doubt, leave this setting as None. This setting automatically adjusts the pixel format to match the selected profile. // Developer note: despite the presence of two pixel format options (one set by the plugin, the other by PeerTube), ffmpeg will only utilize the final one."
    const setting_audio_config_enabled_description =
    "Determine whether to apply custom audio configurations during the encoding process. // Admin notice: PeerTube's default behavior may instruct ffmpeg to duplicate the audio stream which could lead to an error if you attempt to apply custom audio configurations. To avoid this, ensure to recompile PeerTube with this option disabled (found in packages/ffmpeg/src/ffmpeg-default-transcoding-profile.ts, lines 47-49). // Warning: this setting essentially controls the ffmpeg command; adding or modifying configurations here may potentially break the encoding process, introduce security risks, or cause other unexpected issues. While basic checks are performed (currently for bitrate [-b:a], audio filters [-filter:a], [-af], and AAC options [-aac_*]), it's crucial to proceed with caution."
    const setting_audio_configuration_description =
    "Specify the audio configurations to be used during the encoding process. By default, a basic loudness normalization (-16 LUFS, -1 dBTP) (only for VOD) and bitrate setting (320k for VOD and 286k for live streams) are applied. Each argument and its corresponding value should be separated by a space. Please be aware that only bitrate, audio filters, and AAC options are currently supported. // Warning: this setting directly influences the ffmpeg command used for encoding. Any changes you make here can potentially disrupt the encoding process, introduce vulnerabilities, or result in unexpected behavior."

    const setting_preset_options = [
        { label: "Ultra Fast", value: "ultrafast" },
        { label: "Super Fast", value: "superfast" },
        { label: "Very Fast", value: "veryfast" },
        { label: "Faster", value: "faster" },
        { label: "Fast", value: "fast" },
        { label: "Medium", value: "medium" },
        { label: "Slow", value: "slow" },
        { label: "Slower", value: "slower" },
        { label: "Very Slow", value: "veryslow" },
    ]
    const setting_tune_options = [
        { label: "None", value: null },
        { label: "Film", value: "film" },
        { label: "Animation", value: "animation" },
        { label: "Grain", value: "grain" },
        { label: "Still Image", value: "stillimage" },
        { label: "Fast Decode", value: "fastdecode" },
        { label: "Zero Latency", value: "zerolatency" },
    ]
    const setting_profile_options = [
        { label: "None", value: null },
        { label: "Baseline", value: "baseline" },
        { label: "Main", value: "main" },
        { label: "High", value: "high" },
        { label: "High 10", value: "high10" },
        { label: "High 4:2:2", value: "high422" },
        { label: "High 4:4:4", value: "high444" },
    ]

    const store = {
        vod_crf: await settingsManager.getSetting("vod_crf") || vod_default_crf,
        vod_preset: await settingsManager.getSetting("vod_preset") || vod_default_preset,
        vod_tune: await settingsManager.getSetting("vod_tune") || vod_default_tune,
        vod_profile: await settingsManager.getSetting("vod_profile") || vod_default_profile,
        vod_audio_config_enabled: await settingsManager.getSetting("vod_audio_config_enabled") || vod_default_audio_config_enabled,
        vod_audio_configuration: await settingsManager.getSetting("vod_audio_configuration") || vod_default_audio_configuration,
        live_crf: await settingsManager.getSetting("live_crf") || live_default_crf,
        live_preset: await settingsManager.getSetting("live_preset") || live_default_preset,
        live_tune: await settingsManager.getSetting("live_tune") || live_default_tune,
        live_profile: await settingsManager.getSetting("live_profile") || live_default_profile,
        live_audio_config_enabled: await settingsManager.getSetting("live_audio_config_enabled") || live_default_audio_config_enabled,
        live_audio_configuration: await settingsManager.getSetting("live_audio_configuration") || live_default_audio_configuration,
    }
    settingsManager.onSettingsChange((settings) => {
        store.vod_crf = settings["vod_crf"]
        store.vod_preset = settings["vod_preset"]
        store.vod_tune = settings["vod_tune"]
        store.vod_profile = settings["vod_profile"]
        store.vod_audio_config_enabled = settings["vod_audio_config_enabled"]
        store.vod_audio_configuration = settings["vod_audio_configuration"]
        store.live_crf = settings["live_crf"]
        store.live_preset = settings["live_preset"]
        store.live_tune = settings["live_tune"]
        store.live_profile = settings["live_profile"]
        store.live_audio_config_enabled = settings["live_audio_config_enabled"]
        store.live_audio_configuration = settings["live_audio_configuration"]
    })

    registerSetting({
        name: "vod_crf",
        label: "[VOD] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: setting_crf_description,
        private: true,
        default: vod_default_crf,
    })
    registerSetting({
        name: "vod_preset",
        label: "[VOD] Preset",
        type: "select",
        options: setting_preset_options,
        descriptionHTML: setting_preset_description,
        private: true,
        default: vod_default_preset,
    })
    registerSetting({
        name: "vod_tune",
        label: "[VOD] Tune",
        type: "select",
        options: setting_tune_options,
        descriptionHTML: setting_tune_description,
        private: true,
        default: vod_default_tune,
    })
    registerSetting({
        name: "vod_profile",
        label: "[VOD] Profile",
        type: "select",
        options: setting_profile_options,
        descriptionHTML: setting_profile_description,
        private: true,
        default: vod_default_profile,
    })
    registerSetting({
        name: "vod_audio_config_enabled",
        label: "[VOD] Add Audio Configuration?",
        type: "input-checkbox",
        descriptionHTML: setting_audio_config_enabled_description,
        private: true,
        default: vod_default_audio_config_enabled,
    })
    registerSetting({
        name: "vod_audio_configuration",
        label: "[VOD] Audio Configurations",
        type: "input",
        descriptionHTML: setting_audio_configuration_description,
        private: true,
        default: vod_default_audio_configuration,
    })

    registerSetting({
        name: "live_crf",
        label: "[LIVE] Constatnt Rate Factor (CRF)",
        type: "input",
        descriptionHTML: setting_crf_description,
        private: true,
        default: live_default_crf,
    })
    registerSetting({
        name: "live_preset",
        label: "[LIVE] Preset",
        type: "select",
        options: setting_preset_options,
        descriptionHTML: setting_preset_description,
        private: true,
        default: live_default_preset,
    })
    registerSetting({
        name: "live_tune",
        label: "[LIVE] Tune",
        type: "select",
        options: setting_tune_options,
        descriptionHTML: setting_tune_description,
        private: true,
        default: live_default_tune,
    })
    registerSetting({
        name: "live_profile",
        label: "[LIVE] Profile",
        type: "select",
        options: setting_profile_options,
        descriptionHTML: setting_profile_description,
        private: true,
        default: live_default_profile,
    })
    registerSetting({
        name: "live_audio_config_enabled",
        label: "[LIVE] Add Audio Configuration?",
        type: "input-checkbox",
        descriptionHTML: setting_audio_config_enabled_description,
        private: true,
        default: live_default_audio_config_enabled,
    })
    registerSetting({
        name: "live_audio_configuration",
        label: "[LIVE] Audio Configurations",
        type: "input",
        descriptionHTML: setting_audio_configuration_description,
        private: true,
        default: live_default_audio_configuration,
    })

    function buildCRF(settingName, options) {
        let crf = store[settingName]
        if (crf < 0) {
            crf = 0
        } else {
            crf = Math.min(crf, 51)
        }
        return `${buildStreamSuffix("-crf:v", options.streamNum)} ${crf}`
    }

    function buildPreset(settingName, options) {
        return `${buildStreamSuffix("-preset:v", options.streamNum)} ${store[settingName]}`
    }

    const buildTune = function(settingName, options) {
        const tune = store[settingName]
        if (tune !== null && tune !== undefined && tune !== "" && tune !== "none" && tune !== "null") {
            return `${buildStreamSuffix("-tune:v", options.streamNum)} ${tune}`
        } else {
            return ""
        }
    }

    function buildProfile(settingName, options) {
        const profile = store[settingName]
        if (profile) {
            const outputOptions = [`${buildStreamSuffix("-profile:v", options.streamNum)} ${profile}`]
            switch (profile) {
            case "high10":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv420p10le`)
                break
            case "high422":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv422p`)
                break
            case "high444":
                outputOptions.push(`${buildStreamSuffix("-pix_fmt:v", options.streamNum)} yuv444p`)
                break
            }
            return outputOptions
        } else {
            return ""
        }
    }

    function buildAudioOptions(settingName, options) {
        const audioConfig = store[settingName]
        if (!audioConfig) {
            return ""
        }
        const audioOptions = audioConfig.split(" ")
        if (audioOptions.length % 2 !== 0) {
            logger.warn(`Invalid audio configuration: ${audioConfig}`)
            return ""
        }
        return audioOptions.reduce((acc, option, index) => {
            if (index % 2 !== 0) {
                return acc
            }
            const [prefix, value] = [option, audioOptions[index + 1]]
            switch (prefix) {
            case "-b:a":
                acc.push(`${buildStreamSuffix("-b:a", options.streamNum)} ${value}`)
                break
            case "-af":
                acc.push(`${buildStreamSuffix("-af", options.streamNum)} ${value}`)
                break
            case "-filter:a":
                acc.push(`${buildStreamSuffix("-filter:a", options.streamNum)} ${value}`)
                break
            case "-aac_":
                acc.push(`${buildStreamSuffix(prefix, options.streamNum)} ${value}`)
                break
            default:
                logger.warn(`Unknown audio option: ${option}`)
            }
            return acc
        }, [])
    }

    const encoder = "libx264"
    const profileName = "vprw-custom-profile"

    function buildVODOptions(options) {
        logger.info("Building VOD options")
        const outputOptions = [
            `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
            buildCRF("vod_crf", options),
            buildPreset("vod_preset", options),
            buildTune("vod_tune", options),
            ...buildProfile("vod_profile", options),
        ]
        if (store.vod_audio_config_enabled) {
            outputOptions.push(...buildAudioOptions("vod_audio_configuration", options))
        }
        return {
            outputOptions: outputOptions.filter((x) => x),
        }
    }
    transcodingManager.addVODProfile(encoder, profileName, buildVODOptions)

    function buildLiveOptions(options) {
        logger.info("Building LIVE options")
        const outputOptions = [
            `${buildStreamSuffix("-r:v", options.streamNum)} ${options.fps}`,
            buildCRF("live_crf", options),
            buildPreset("live_preset", options),
            buildTune("live_tune", options),
            ...buildProfile("live_profile", options),
        ]
        if (store.live_audio_config_enabled) {
            outputOptions.push(...buildAudioOptions("live_audio_configuration", options))
        }
        return {
            outputOptions: outputOptions.filter((x) => x),
        }
    }
    transcodingManager.addLiveProfile(encoder, profileName, buildLiveOptions)
}

async function unregister() {
    return
}

module.exports = {
    register,
    unregister,
}

function buildStreamSuffix(base, streamNum) {
    if (streamNum !== undefined) {
        return `${base}:${streamNum}`
    }
    return base
}
