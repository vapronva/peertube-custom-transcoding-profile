# PeerTube Plugin — Custom Transcoding Profile

> *so good it's almost lossless™*

This plugin introduces a transcoding profile with configurable settings for [CRF](#crf), [preset](#preset), [tune](#tune), [profile](#profile), and [custom audio parameters](#audio). All the configurations and settings revolve around [ffmpeg](https://ffmpeg.org), providing you with a flexible means to manipulate the transcoding process.

## Reference to Original Project

This plugin is a derivative of the [`peertube-plugin-transcoding-custom-quality`](https://framagit.org/framasoft/peertube/official-plugins/-/tree/master/peertube-plugin-transcoding-custom-quality) project, developed by [Framasoft](https://framasoft.org/en/), specifically [Chocobozzz](https://framagit.org/chocobozzz) and other [Individual Contributors](https://framagit.org/framasoft/peertube/official-plugins/-/graphs/master). The original project is licensed under [AGPL 3.0](https://framagit.org/framasoft/peertube/official-plugins/-/blob/master/LICENSE).

## Modification Details and Available Options

The following modifications and additions have been made to the original project:

- the default CRF values have been fine-tuned;
- a `profile` option has been added;
- a `tune` option has been added;
- a `preset` option has been added;
- audio-related options have been integrated;
- code linting and formatting.

### CRF

CRF (Constant Rate Factor) is a setting for the video encoder that balances video quality against file size. The lower the CRF value, the higher the video quality, but also the larger the file size.

In this plugin, the default CRF value is set to 20 for VOD and 21 for live streams.

For more information on CRF, refer to [ffmpeg's guide on CRF in H.264](https://trac.ffmpeg.org/wiki/Encode/H.264#crf).

### Profile

The `profile` option allows you to specify the encoding profile. Not all codecs support all profiles, and not all devices can play all profiles. Setting up the right profile ensures compatibility and *efficiency*.

The default profile is set to "`high`" for both VOD and live streams.

For more details on profiles, refer to [ffmpeg's guide on profiles in H.264](https://trac.ffmpeg.org/wiki/Encode/H.264#Profile) and [Wikipedia's article on H.264 profiles](https://en.wikipedia.org/wiki/Advanced_Video_Coding#Profiles).

### Tune

The `tune` option helps you optimize the settings for specific types of source material.

While the default tune for VOD is set to nothing, for live streams it is set to "`zerolatency`" to reduce encoding latency.

For more information on tune settings, refer to [ffmpeg's guide on tune settings in `x264`](https://trac.ffmpeg.org/wiki/Encode/H.264#Tune).

### Preset

The `preset` option determines the encoding speed to compression ratio. A slower preset will provide better compression. This means that, given a certain file size or bit rate, using a slower preset will increase quality; or, given a certain quality level, will reduce the bit rate.

The default preset for VOD is "`slow`", and for live streams, it's "`fast`".

For further details on presets, refer to [ffmpeg's guide on presets in `x264`](https://trac.ffmpeg.org/wiki/Encode/H.264#Preset).

### Audio

The plugin provides the ability to apply custom audio configurations during the encoding process. This feature is disabled by default, but can be enabled according to your needs.

The default audio configuration for VOD is "`-b:a 320k -filter:a loudnorm=I=-16:TP=-1.0`" (320 kbps bitrate and loudness normalization to -16.0 LUFS and -1.0 dB true peak), and for live streams, it's "`-b:a 286k`".

For more insights into audio encoding with ffmpeg, refer to [ffmpeg's guide on AAC encoding](https://trac.ffmpeg.org/wiki/Encode/AAC) and [ffmpeg's `aac` encoder parameters](https://ffmpeg.org/ffmpeg-codecs.html#aac), as well as [ffmpeg's guide on audio filters](https://ffmpeg.org/ffmpeg-filters.html#Audio-Filters).

### Other

Please note that these settings directly influence the ffmpeg command used for encoding, and any changes might disrupt the encoding process, introduce vulnerabilities, or result in unexpected behavior. Therefore, it's crucial to proceed with caution, and to test the settings thoroughly before applying them to a production environment.

## Note on Audio Options

To fully utilize the "audio configuration" in this plugin, it might be necessary to disable PeerTube's default behavior of instructing ffmpeg to copy the audio stream, when available. The reason is that this behavior could lead to an error if you attempt to apply audio filtering.

To disable this, you will need to apply a simple patch to PeerTube's source code. [The patch](https://gl.vprw.ru/oss-images/chocobozzz-peertube/-/blob/73bf3a65fe985eeec9ec6d0d34938e4041e680ea/src/patches/remove_audio_copying.patch) removes the check for availability of copying the audio stream from [`packages/ffmpeg/src/ffmpeg-default-transcoding-profile.ts` at lines 47-49](https://github.com/Chocobozzz/PeerTube/blob/ea01bf016750ae5e280c19c5e081f1d7adcb2c9a/packages/ffmpeg/src/ffmpeg-default-transcoding-profile.ts#L47-L49).

Please proceed with caution when modifying the underlying behavior of PeerTube's transcoding process.
