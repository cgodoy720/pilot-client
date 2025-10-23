# Address Autocomplete Setup Guide

The application form now includes an address autocomplete feature that helps users quickly and accurately enter their addresses. This feature uses Google Maps Places API.

## Current Status
✅ **Component is ready and working**  
⚠️ **Google Maps API key needed for full functionality**

## How it works right now:
- **Without API key**: Shows a regular text input with helpful placeholder text
- **With API key**: Provides real-time address suggestions as users type

## Setup Instructions (Optional)

### 1. Get a Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for address validation)
4. Create credentials → API Key
5. Copy your API key

### 2. Add API Key to Environment
1. In the `adm-app-2/pilot-client/` directory, create a `.env` file:
   ```bash
   touch .env
   ```

2. Add your API key to the `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

### 3. Test the Feature
1. Navigate to the application form
2. Find the "What is your home address?" question
3. Start typing an address - you should see autocomplete suggestions appear

## Features

### With Google Maps API:
- ✅ Real-time address suggestions
- ✅ Structured address formatting
- ✅ Address validation
- ✅ Keyboard navigation (arrow keys, enter, escape)
- ✅ Click to select suggestions
- ✅ US address filtering
- ✅ Loading indicators

### Without Google Maps API:
- ✅ Regular text input with helpful placeholder
- ✅ All form validation still works
- ✅ Graceful fallback experience

## Security Notes
- The API key is only used in the browser (client-side)
- Consider setting up API key restrictions in Google Cloud Console
- Restrict the key to your domain for production use

## Cost Considerations
- Google Maps Places API has a free tier
- Typical usage for a form like this should stay within free limits
- Monitor usage in Google Cloud Console

## Troubleshooting

### "Address lookup requires Google Maps API key"
- This is normal without an API key
- Users can still enter addresses manually
- Follow setup instructions above to enable autocomplete

### API key not working
- Check that the API key is correct in `.env`
- Ensure Places API and Geocoding API are enabled
- Restart the development server after adding the key
- Check browser console for any error messages

### No suggestions appearing
- Ensure you're typing at least 3 characters
- Check that the API key has proper permissions
- Verify the APIs are enabled in Google Cloud Console 