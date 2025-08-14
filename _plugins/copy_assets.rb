Jekyll::Hooks.register :site, :post_write do |site|
  if site.data['files']
    site.data['files'].each do |file|
      source = File.join(site.source, file['source'])
      target_dir = File.join(site.dest, file['target'])
      target = File.join(target_dir, File.basename(file['source']))
      
      FileUtils.mkdir_p(target_dir) unless Dir.exist?(target_dir)
      FileUtils.cp(source, target) if File.exist?(source)
    end
  end
end
