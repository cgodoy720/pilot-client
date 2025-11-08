#!/usr/bin/env python3
"""Google Drive-specific example for the MCP client."""

import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

from mcp_client import UnifiedMCPClient

# Load environment variables
load_dotenv()


async def google_drive_demo():
    """Demonstrate Google Drive MCP client functionality."""
    client = UnifiedMCPClient()
    
    try:
        print("💾 Google Drive MCP Client Demo")
        print("=" * 40)
        
        # Connect to Google Drive
        print("\n🔌 Connecting to Google Drive...")
        gdrive = await client.connect_google_drive("stdio")  # Change to WebSocket URI if needed
        print("✅ Connected to Google Drive!")
        
        # Get service information
        info = await gdrive.get_service_info()
        print(f"\n📋 Service Info:")
        print(f"   Service: {info['service']}")
        print(f"   Authenticated: {info['authenticated']}")
        print(f"   User: {info['config'].get('user_name', 'Unknown')}")
        print(f"   Email: {info['config'].get('user_email', 'Unknown')}")
        print(f"   Available Tools: {len(info['available_tools'])}")
        
        # List recent files
        print("\n📁 Recent Files:")
        try:
            files_result = await gdrive.list_files(page_size=10, order_by="modifiedTime desc")
            files = files_result.get("files", [])
            
            print(f"   Found {len(files)} files")
            
            for i, file in enumerate(files[:5], 1):
                name = file.get("name", "Unknown")
                file_type = file.get("mimeType", "").split('/')[-1] if file.get("mimeType") else "unknown"
                size = file.get("size")
                modified = file.get("modifiedTime", "Unknown")
                
                # Format file size
                if size:
                    size_int = int(size)
                    if size_int < 1024:
                        size_str = f"{size_int} B"
                    elif size_int < 1024 * 1024:
                        size_str = f"{size_int / 1024:.1f} KB"
                    else:
                        size_str = f"{size_int / (1024 * 1024):.1f} MB"
                else:
                    size_str = "N/A"
                
                # Get file type emoji
                if "folder" in file.get("mimeType", ""):
                    type_icon = "📁"
                elif "document" in file.get("mimeType", ""):
                    type_icon = "📄"
                elif "spreadsheet" in file.get("mimeType", ""):
                    type_icon = "📊"
                elif "presentation" in file.get("mimeType", ""):
                    type_icon = "📈"
                elif "image" in file.get("mimeType", ""):
                    type_icon = "🖼️"
                else:
                    type_icon = "📎"
                
                print(f"   {i}. {type_icon} {name}")
                print(f"      Size: {size_str} | Modified: {modified[:10] if modified != 'Unknown' else 'Unknown'}")
                
        except Exception as e:
            print(f"   ❌ Failed to list files: {e}")
        
        # Search for specific files
        print("\n🔍 Search Results (Documents):")
        try:
            # Search for Google Docs
            search_query = "mimeType='application/vnd.google-apps.document'"
            search_result = await gdrive.search_files(search_query, max_results=5)
            docs = search_result.get("files", [])
            
            if docs:
                print(f"   Found {len(docs)} Google Docs")
                for i, doc in enumerate(docs[:3], 1):
                    name = doc.get("name", "Unknown")
                    modified = doc.get("modifiedTime", "Unknown")
                    print(f"   {i}. 📄 {name}")
                    print(f"      Modified: {modified[:10] if modified != 'Unknown' else 'Unknown'}")
            else:
                print("   No Google Docs found")
                
        except Exception as e:
            print(f"   ❌ Failed to search files: {e}")
        
        # List folders
        print("\n📂 Folders:")
        try:
            folder_query = "mimeType='application/vnd.google-apps.folder'"
            folders_result = await gdrive.list_files(query=folder_query, page_size=5)
            folders = folders_result.get("files", [])
            
            if folders:
                print(f"   Found {len(folders)} folders")
                for i, folder in enumerate(folders[:3], 1):
                    name = folder.get("name", "Unknown")
                    modified = folder.get("modifiedTime", "Unknown")
                    print(f"   {i}. 📁 {name}")
                    print(f"      Modified: {modified[:10] if modified != 'Unknown' else 'Unknown'}")
            else:
                print("   No folders found")
                
        except Exception as e:
            print(f"   ❌ Failed to list folders: {e}")
        
        # Get details of a specific file (if any files exist)
        print("\n📋 File Details:")
        try:
            files_result = await gdrive.list_files(page_size=1)
            files = files_result.get("files", [])
            
            if files:
                file_id = files[0]["id"]
                file_details = await gdrive.get_file(file_id)
                
                print(f"   File: {file_details.get('name', 'Unknown')}")
                print(f"   ID: {file_details.get('id', 'Unknown')}")
                print(f"   Type: {file_details.get('mimeType', 'Unknown')}")
                print(f"   Size: {file_details.get('size', 'N/A')} bytes")
                print(f"   Modified: {file_details.get('modifiedTime', 'Unknown')}")
                print(f"   Web Link: {file_details.get('webViewLink', 'N/A')}")
            else:
                print("   No files available to show details")
                
        except Exception as e:
            print(f"   ❌ Failed to get file details: {e}")
        
        # Demonstrate file operations (commented out by default)
        print("\n📝 File Operations:")
        print("   📝 Ready to perform file operations (uncomment code to test)")
        
        # Uncomment the following lines to test file operations
        """
        try:
            # Create a test folder
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            folder_name = f"MCP_Test_Folder_{timestamp}"
            
            folder_result = await gdrive.create_folder(folder_name)
            folder_id = folder_result.get("id")
            print(f"   ✅ Created test folder: {folder_name} ({folder_id})")
            
            # Upload a test file to the folder
            test_content = f"This is a test file created by MCP Client at {datetime.now()}"
            file_name = f"test_file_{timestamp}.txt"
            
            upload_result = await gdrive.upload_file(
                name=file_name,
                content=test_content.encode(),
                mime_type="text/plain",
                parent_folder_id=folder_id
            )
            file_id = upload_result.get("id")
            print(f"   ✅ Uploaded test file: {file_name} ({file_id})")
            
            # Download the file we just uploaded
            downloaded_content = await gdrive.download_file(file_id)
            print(f"   ✅ Downloaded file content: {len(downloaded_content)} bytes")
            print(f"      Content preview: {downloaded_content[:50].decode()}...")
            
            # Clean up - delete the test file and folder
            await gdrive.delete_file(file_id)
            print(f"   ✅ Deleted test file")
            
            await gdrive.delete_file(folder_id)
            print(f"   ✅ Deleted test folder")
            
        except Exception as e:
            print(f"   ❌ File operations failed: {e}")
        """
        
        # Show storage quota information
        print("\n💾 Storage Information:")
        try:
            # This would typically require a separate API call to get quota info
            # For now, we'll just show what we can determine from available files
            all_files = await gdrive.list_files(page_size=100)
            files = all_files.get("files", [])
            
            total_files = len(files)
            total_size = 0
            file_types = {}
            
            for file in files:
                if file.get("size"):
                    total_size += int(file.get("size", 0))
                
                mime_type = file.get("mimeType", "unknown")
                if "folder" in mime_type:
                    file_type = "folder"
                elif "document" in mime_type:
                    file_type = "document"
                elif "spreadsheet" in mime_type:
                    file_type = "spreadsheet"
                elif "presentation" in mime_type:
                    file_type = "presentation"
                elif "image" in mime_type:
                    file_type = "image"
                else:
                    file_type = "other"
                
                file_types[file_type] = file_types.get(file_type, 0) + 1
            
            print(f"   Total Files: {total_files}")
            print(f"   Total Size: {total_size / (1024*1024):.2f} MB")
            print("   File Types:")
            for file_type, count in file_types.items():
                print(f"     {file_type}: {count}")
                
        except Exception as e:
            print(f"   ❌ Failed to get storage info: {e}")
        
        print("\n✨ Google Drive demo completed!")
        
    except Exception as e:
        print(f"❌ Google Drive demo failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up
        await client.disconnect_all()
        print("🧹 Disconnected from Google Drive")


if __name__ == "__main__":
    asyncio.run(google_drive_demo())
